const fs = require('fs');
const path = require('path');

// Directory to process
const srcDir = path.join(__dirname, 'src');

// Color mapping - all navy blues to their variable names
const colorReplacements = [
  // Page header gradients
  { 
    find: /background:\s*linear-gradient\(135deg,\s*#1313a0\s*0%,\s*#0c2876\s*50%,\s*#053b7e\s*100%\)/g,
    replace: 'background: var(--gradient-page-header)'
  },
  
  // Individual navy blue colors
  { find: /#0f1580/g, replace: 'var(--navy-deep)' },
  { find: /#1313a0/g, replace: 'var(--navy-deep)' },
  { find: /#0c2876/g, replace: 'var(--navy-deep)' },
  { find: /#053b7e/g, replace: 'var(--navy-deep)' },
  { find: /#1a22b0/g, replace: 'var(--navy-deep)' },
  { find: /#1e2ecc/g, replace: 'var(--navy-deep)' },
  { find: /#0a0233/g, replace: 'var(--navy-deep)' },
  { find: /#0a1628/g, replace: 'var(--navy-deep)' },
  { find: /#0d1f38/g, replace: 'var(--navy-deep)' },
  { find: /#0f2442/g, replace: 'var(--navy-deep)' },
];

// Get all CSS files
function getCSSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getCSSFiles(file));
    } else if (file.endsWith('.css')) {
      results.push(file);
    }
  });
  
  return results;
}

// Process each CSS file
const cssFiles = getCSSFiles(srcDir);
console.log(`Found ${cssFiles.length} CSS files\n`);

let totalReplacements = 0;

cssFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  // Check if file needs the import statement
  const hasImport = content.includes("@import '../../styles/variables.css';") || 
                    content.includes("@import '../styles/variables.css';");
  
  let needsImport = false;
  
  // Apply replacements
  colorReplacements.forEach(({ find, replace }) => {
    const matches = content.match(find);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(find, replace);
      needsImport = true;
    }
  });
  
  // Add import statement if needed and not already present
  if (needsImport && !hasImport) {
    const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'styles', 'variables.css'));
    const importStatement = `/* Import centralized CSS variables */\n@import '${relativePath}';\n\n`;
    content = importStatement + content;
  }
  
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalReplacements += fileReplacements;
    console.log(`✓ ${path.relative(srcDir, filePath)}: ${fileReplacements} replacements`);
  }
});

console.log(`\n✅ Total replacements: ${totalReplacements}`);
console.log('📝 All navy blue colors have been replaced with var(--navy-deep)');
console.log('💡 The color #1A1ADB is defined in src/styles/variables.css');
