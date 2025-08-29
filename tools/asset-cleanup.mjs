#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧹 HRMS Asset Cleanup Tool');
console.log('─'.repeat(50));

class AssetCleaner {
    constructor() {
        this.reportPath = path.join(rootDir, 'reports', 'assets-report.json');
        this.report = null;
        this.cleanupResults = {
            removedFiles: [],
            updatedReferences: [],
            errors: []
        };
    }

    loadReport() {
        try {
            const reportData = fs.readFileSync(this.reportPath, 'utf8');
            this.report = JSON.parse(reportData);
            console.log('✅ Loaded audit report');
        } catch (error) {
            console.error('❌ Failed to load audit report:', error.message);
            console.log('   Run: node tools/asset-audit.mjs --dry-run first');
            process.exit(1);
        }
    }

    async removeUnusedAssets() {
        console.log('\n🗑️  Removing unused assets...');
        
        for (const asset of this.report.unused) {
            const fullPath = path.join(rootDir, asset);
            
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    this.cleanupResults.removedFiles.push(asset);
                    console.log(`   ✅ Removed: ${asset}`);
                } else {
                    console.log(`   ⚠️  Not found: ${asset}`);
                }
            } catch (error) {
                this.cleanupResults.errors.push(`Failed to remove ${asset}: ${error.message}`);
                console.error(`   ❌ Error removing ${asset}: ${error.message}`);
            }
        }
    }

    async consolidateIdenticalDuplicates() {
        console.log('\n🔄 Consolidating identical duplicates...');
        
        for (const group of this.report.duplicates.identical) {
            if (group.files.length < 2) continue;
            
            // Keep the first file (canonical), remove others
            const canonical = group.files[0];
            const toRemove = group.files.slice(1);
            
            console.log(`   📋 Group: ${group.checksum.substring(0, 8)}...`);
            console.log(`   ✅ Keep: ${canonical}`);
            
            // Update all references to point to canonical file
            for (const duplicate of toRemove) {
                await this.updateFileReferences(duplicate, canonical);
                
                // Remove the duplicate file
                const fullPath = path.join(rootDir, duplicate);
                try {
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        this.cleanupResults.removedFiles.push(duplicate);
                        console.log(`   🗑️  Removed: ${duplicate}`);
                    }
                } catch (error) {
                    this.cleanupResults.errors.push(`Failed to remove duplicate ${duplicate}: ${error.message}`);
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }
    }

    async consolidateLikelyDuplicates() {
        console.log('\n🔍 Handling likely duplicates...');
        
        for (const group of this.report.duplicates.likely) {
            console.log(`   📋 Group: ${group.baseName}`);
            
            // For likely duplicates, we'll be more conservative
            // Just report them for manual review
            group.files.forEach(file => {
                console.log(`   ⚠️  Review needed: ${file}`);
            });
            
            // Special handling for specific known patterns
            if (group.baseName === 'landing') {
                // Keep landing-enhanced, remove basic landing if not heavily used
                const basicFiles = group.files.filter(f => f.includes('landing.'));
                const enhancedFiles = group.files.filter(f => f.includes('landing-enhanced.'));
                
                if (basicFiles.length > 0 && enhancedFiles.length > 0) {
                    console.log(`   💡 Suggestion: Consider keeping enhanced version, review basic version usage`);
                }
            }
        }
    }

    async updateFileReferences(oldPath, newPath) {
        const referencingFiles = this.report.crossRefs[oldPath] || [];
        
        for (const refFile of referencingFiles) {
            const fullRefPath = path.join(rootDir, refFile);
            
            try {
                if (!fs.existsSync(fullRefPath)) continue;
                
                let content = fs.readFileSync(fullRefPath, 'utf8');
                const originalContent = content;
                
                // Replace various types of references
                const patterns = [
                    // href attributes
                    new RegExp(`href=["']([^"']*)?${this.escapeRegex(oldPath)}["']`, 'g'),
                    // src attributes
                    new RegExp(`src=["']([^"']*)?${this.escapeRegex(oldPath)}["']`, 'g'),
                    // import statements
                    new RegExp(`import[^"']*["']([^"']*)?${this.escapeRegex(oldPath)}["']`, 'g'),
                    // require statements
                    new RegExp(`require\\(["']([^"']*)?${this.escapeRegex(oldPath)}["']\\)`, 'g')
                ];
                
                patterns.forEach(pattern => {
                    content = content.replace(pattern, (match) => {
                        return match.replace(oldPath, newPath);
                    });
                });
                
                if (content !== originalContent) {
                    fs.writeFileSync(fullRefPath, content);
                    this.cleanupResults.updatedReferences.push({
                        file: refFile,
                        from: oldPath,
                        to: newPath
                    });
                    console.log(`   📝 Updated references in: ${refFile}`);
                }
            } catch (error) {
                this.cleanupResults.errors.push(`Failed to update references in ${refFile}: ${error.message}`);
                console.error(`   ❌ Error updating ${refFile}: ${error.message}`);
            }
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    removeBackupFiles() {
        console.log('\n🧹 Removing backup files...');
        
        // Remove known backup files
        const backupPatterns = [
            'assets/js/content-manager.js.backup',
            'assets/js/content-manager.js.backup2'
        ];
        
        for (const backupFile of backupPatterns) {
            const fullPath = path.join(rootDir, backupFile);
            
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    this.cleanupResults.removedFiles.push(backupFile);
                    console.log(`   ✅ Removed backup: ${backupFile}`);
                }
            } catch (error) {
                this.cleanupResults.errors.push(`Failed to remove backup ${backupFile}: ${error.message}`);
                console.error(`   ❌ Error: ${error.message}`);
            }
        }
    }

    printSummary() {
        console.log('\n📊 CLEANUP SUMMARY');
        console.log('─'.repeat(50));
        console.log(`🗑️  Files removed: ${this.cleanupResults.removedFiles.length}`);
        console.log(`📝 References updated: ${this.cleanupResults.updatedReferences.length}`);
        console.log(`❌ Errors: ${this.cleanupResults.errors.length}`);
        
        if (this.cleanupResults.removedFiles.length > 0) {
            console.log('\n🗑️  REMOVED FILES:');
            this.cleanupResults.removedFiles.forEach(file => console.log(`   • ${file}`));
        }
        
        if (this.cleanupResults.updatedReferences.length > 0) {
            console.log('\n📝 UPDATED REFERENCES:');
            this.cleanupResults.updatedReferences.forEach(ref => 
                console.log(`   • ${ref.file}: ${ref.from} → ${ref.to}`)
            );
        }
        
        if (this.cleanupResults.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.cleanupResults.errors.forEach(error => console.log(`   • ${error}`));
        }
    }

    async run() {
        try {
            this.loadReport();
            await this.removeUnusedAssets();
            await this.consolidateIdenticalDuplicates();
            await this.consolidateLikelyDuplicates();
            this.removeBackupFiles();
            this.printSummary();
            
            console.log('\n✅ Asset cleanup completed');
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the cleaner
const cleaner = new AssetCleaner();
cleaner.run().catch(console.error);