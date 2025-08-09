#!/usr/bin/env node

/**
 * Verification script for Cloudflare Pages deployment
 * Checks if the build output is correct and ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

console.log('🔍 Verifying Cloudflare Pages build output...\n');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist directory not found. Run "npm run build:cloudflare" first.');
  process.exit(1);
}

// Required files for Cloudflare Pages
const requiredFiles = [
  'index.html',
  '_redirects',
  '_headers'
];

let allChecks = true;

// Check required files
console.log('📁 Checking required files:');
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allChecks = false;
  }
}

// Check index.html content
console.log('\n📄 Checking index.html content:');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Should NOT contain references to source files
  if (indexContent.includes('/src/main.jsx')) {
    console.log('   ❌ index.html contains development references to /src/main.jsx');
    allChecks = false;
  } else {
    console.log('   ✅ No development file references found');
  }
  
  // Should contain references to built assets
  if (indexContent.includes('/assets/') && indexContent.includes('.js')) {
    console.log('   ✅ Built asset references found');
  } else {
    console.log('   ❌ No built asset references found');
    allChecks = false;
  }
}

// Check assets directory
console.log('\n🎨 Checking assets:');
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  const jsFiles = assets.filter(f => f.endsWith('.js'));
  const cssFiles = assets.filter(f => f.endsWith('.css'));
  
  console.log(`   ✅ Found ${jsFiles.length} JS file(s): ${jsFiles.join(', ')}`);
  console.log(`   ✅ Found ${cssFiles.length} CSS file(s): ${cssFiles.join(', ')}`);
} else {
  console.log('   ❌ Assets directory not found');
  allChecks = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allChecks) {
  console.log('✅ Build verification PASSED! Ready for Cloudflare Pages deployment.');
  console.log('\nNext steps:');
  console.log('1. Ensure Cloudflare Pages build output directory is set to "dist"');
  console.log('2. Use build command: "npm run build:cloudflare"');
  console.log('3. Deploy and test!');
} else {
  console.log('❌ Build verification FAILED! Please fix the issues above.');
  process.exit(1);
}