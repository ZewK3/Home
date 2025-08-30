#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const ASSETS_DIR = path.join(rootDir, 'assets');
const CSS_DIR = path.join(ASSETS_DIR, 'css');
const JS_DIR = path.join(ASSETS_DIR, 'js');
const REPORTS_DIR = path.join(rootDir, 'reports');

// Command line arguments
const isDryRun = process.argv.includes('--dry-run');

console.log('🔍 HRMS Asset Audit Tool');
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'EXECUTE'}`);
console.log('─'.repeat(50));

class AssetAuditor {
    constructor() {
        this.usedAssets = new Set();
        this.assetFiles = { css: [], js: [] };
        this.duplicates = { identical: [], likely: [] };
        this.crossRefs = new Map();
        this.report = {
            used: [],
            unused: [],
            duplicates: { identical: [], likely: [] },
            crossRefs: {}
        };
    }

    // Get checksum of file content
    getFileChecksum(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return crypto.createHash('sha1').update(content).digest('hex');
        } catch (error) {
            console.warn(`⚠️  Cannot read ${filePath}: ${error.message}`);
            return null;
        }
    }

    // Find all asset files
    scanAssetFiles() {
        console.log('📁 Scanning asset files...');
        
        if (fs.existsSync(CSS_DIR)) {
            this.assetFiles.css = fs.readdirSync(CSS_DIR)
                .filter(file => file.endsWith('.css'))
                .map(file => path.join(CSS_DIR, file));
        }

        if (fs.existsSync(JS_DIR)) {
            this.assetFiles.js = fs.readdirSync(JS_DIR)
                .filter(file => file.endsWith('.js'))
                .map(file => path.join(JS_DIR, file));
        }

        console.log(`   Found ${this.assetFiles.css.length} CSS files`);
        console.log(`   Found ${this.assetFiles.js.length} JS files`);
    }

    // Find all HTML and JS files to scan
    getAllSourceFiles() {
        const sourceFiles = [];
        
        const findFiles = (dir, extensions) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    findFiles(fullPath, extensions);
                } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                    sourceFiles.push(fullPath);
                }
            }
        };

        findFiles(rootDir, ['.html', '.js']);
        return sourceFiles;
    }

    // Extract asset references from file content
    extractAssetReferences(filePath, content) {
        const references = new Set();
        
        // CSS references
        const cssPatterns = [
            /<link[^>]+href=["']([^"']+\.css)[^"']*["']/gi,
            /import\s+["']([^"']+\.css)["']/gi,
            /require\(["']([^"']+\.css)["']\)/gi,
            /fetch\(["']([^"']+\.css)["']\)/gi
        ];

        // JS references
        const jsPatterns = [
            /<script[^>]+src=["']([^"']+\.js)[^"']*["']/gi,
            /import[^"']+["']([^"']+\.js)["']/gi,
            /require\(["']([^"']+\.js)["']\)/gi,
            /document\.createElement\(['"]script['"]\)[^;]*src\s*=\s*["']([^"']+\.js)["']/gi,
            /fetch\(["']([^"']+\.js)["']\)/gi,
            /loadScript\(["']([^"']+\.js)["']/gi,
            /\.src\s*=\s*["']([^"']+\.js)["']/gi
        ];

        // Combine all patterns
        const allPatterns = [...cssPatterns, ...jsPatterns];
        
        for (const pattern of allPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                let assetPath = match[1];
                
                // Normalize path (remove leading slashes, resolve relative paths)
                assetPath = assetPath.replace(/^\.?\/+/, '');
                
                // Convert to absolute path from root
                if (!path.isAbsolute(assetPath)) {
                    const relativeTo = path.dirname(filePath);
                    const resolvedPath = path.resolve(relativeTo, assetPath);
                    assetPath = path.relative(rootDir, resolvedPath);
                }
                
                references.add(assetPath);
                
                // Track cross-references
                if (!this.crossRefs.has(assetPath)) {
                    this.crossRefs.set(assetPath, new Set());
                }
                this.crossRefs.get(assetPath).add(path.relative(rootDir, filePath));
            }
        }

        return references;
    }

    // Scan all source files for asset references
    scanAssetReferences() {
        console.log('🔎 Scanning for asset references...');
        
        const sourceFiles = this.getAllSourceFiles();
        console.log(`   Scanning ${sourceFiles.length} source files...`);

        for (const filePath of sourceFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const references = this.extractAssetReferences(filePath, content);
                
                for (const ref of references) {
                    this.usedAssets.add(ref);
                }
            } catch (error) {
                console.warn(`⚠️  Cannot read ${filePath}: ${error.message}`);
            }
        }

        console.log(`   Found ${this.usedAssets.size} asset references`);
    }

    // Detect duplicate files
    detectDuplicates() {
        console.log('🔍 Detecting duplicates...');
        
        const allFiles = [...this.assetFiles.css, ...this.assetFiles.js];
        const checksumMap = new Map();
        const nameGroups = new Map();

        // Group by checksum (identical files)
        for (const filePath of allFiles) {
            const checksum = this.getFileChecksum(filePath);
            if (!checksum) continue;

            if (!checksumMap.has(checksum)) {
                checksumMap.set(checksum, []);
            }
            checksumMap.get(checksum).push(filePath);
        }

        // Find identical duplicates
        for (const [checksum, files] of checksumMap) {
            if (files.length > 1) {
                this.duplicates.identical.push({
                    checksum,
                    files: files.map(f => path.relative(rootDir, f))
                });
            }
        }

        // Group by similar names (likely duplicates)
        for (const filePath of allFiles) {
            const fileName = path.basename(filePath, path.extname(filePath));
            const normalizedName = fileName
                .toLowerCase()
                .replace(/[-_]/g, '')
                .replace(/\d+$/, '') // Remove version numbers
                .replace(/(backup|old|copy|v\d+|new)$/g, ''); // Remove common suffixes

            if (!nameGroups.has(normalizedName)) {
                nameGroups.set(normalizedName, []);
            }
            nameGroups.get(normalizedName).push(filePath);
        }

        // Find likely duplicates
        for (const [baseName, files] of nameGroups) {
            if (files.length > 1) {
                // Skip if they're already identified as identical
                const relativeFiles = files.map(f => path.relative(rootDir, f));
                const isAlreadyIdentical = this.duplicates.identical.some(group => 
                    group.files.some(file => relativeFiles.includes(file))
                );

                if (!isAlreadyIdentical) {
                    this.duplicates.likely.push({
                        baseName,
                        files: relativeFiles
                    });
                }
            }
        }

        console.log(`   Found ${this.duplicates.identical.length} identical duplicate groups`);
        console.log(`   Found ${this.duplicates.likely.length} likely duplicate groups`);
    }

    // Generate final report
    generateReport() {
        console.log('📊 Generating report...');
        
        const allAssetFiles = [
            ...this.assetFiles.css.map(f => path.relative(rootDir, f)),
            ...this.assetFiles.js.map(f => path.relative(rootDir, f))
        ];

        this.report.used = Array.from(this.usedAssets).filter(asset => {
            const fullPath = path.resolve(rootDir, asset);
            return fs.existsSync(fullPath) && allAssetFiles.includes(asset);
        });

        this.report.unused = allAssetFiles.filter(asset => 
            !this.usedAssets.has(asset) && 
            !this.usedAssets.has(asset.replace(/^assets\//, ''))
        );

        this.report.duplicates = this.duplicates;

        // Convert cross-references to plain object
        this.report.crossRefs = {};
        for (const [asset, refs] of this.crossRefs) {
            this.report.crossRefs[asset] = Array.from(refs);
        }
    }

    // Save report to JSON
    saveReport() {
        const reportPath = path.join(REPORTS_DIR, 'assets-report.json');
        
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
        console.log(`📄 Report saved to: ${reportPath}`);
    }

    // Print summary
    printSummary() {
        console.log('\n📋 AUDIT SUMMARY');
        console.log('─'.repeat(50));
        console.log(`✅ Used assets: ${this.report.used.length}`);
        console.log(`❌ Unused assets: ${this.report.unused.length}`);
        console.log(`🔁 Identical duplicates: ${this.report.duplicates.identical.length} groups`);
        console.log(`🔍 Likely duplicates: ${this.report.duplicates.likely.length} groups`);

        if (this.report.unused.length > 0) {
            console.log('\n❌ UNUSED ASSETS:');
            this.report.unused.forEach(asset => console.log(`   • ${asset}`));
        }

        if (this.report.duplicates.identical.length > 0) {
            console.log('\n🔁 IDENTICAL DUPLICATES:');
            this.report.duplicates.identical.forEach((group, index) => {
                console.log(`   Group ${index + 1} (${group.checksum.substring(0, 8)}...):`);
                group.files.forEach(file => console.log(`     • ${file}`));
            });
        }

        if (this.report.duplicates.likely.length > 0) {
            console.log('\n🔍 LIKELY DUPLICATES:');
            this.report.duplicates.likely.forEach((group, index) => {
                console.log(`   Group ${index + 1} (${group.baseName}):`);
                group.files.forEach(file => console.log(`     • ${file}`));
            });
        }
    }

    // Run full audit
    async run() {
        try {
            this.scanAssetFiles();
            this.scanAssetReferences();
            this.detectDuplicates();
            this.generateReport();
            this.saveReport();
            this.printSummary();

            console.log('\n✅ Asset audit completed successfully');
            
            if (isDryRun) {
                console.log('\n⚠️  DRY RUN mode - no files were modified');
                console.log('   Run without --dry-run to execute cleanup');
            }

        } catch (error) {
            console.error('❌ Audit failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the auditor
const auditor = new AssetAuditor();
auditor.run().catch(console.error);