const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if SafeAreaView is imported from react-native
    const rnImportRegex = /import\s+({[^}]*})\s+from\s+['"]react-native['"];?/g;
    let hasChanges = false;
    let needsSafeAreaContextImport = false;

    content = content.replace(rnImportRegex, (match, imports) => {
        if (imports.includes('SafeAreaView')) {
            needsSafeAreaContextImport = true;
            hasChanges = true;
            
            // Remove SafeAreaView, and handle remaining commas
            let newImports = imports.replace(/\bSafeAreaView\b/g, '')
                                    .replace(/,\s*,/g, ',')
                                    .replace(/{\s*,/g, '{')
                                    .replace(/,\s*}/g, '}')
                                    .trim();
            
            if (newImports === '{}') {
                return ''; // remove entire line if empty
            } else {
                return `import ${newImports} from 'react-native';`;
            }
        }
        return match;
    });

    if (needsSafeAreaContextImport) {
        // Find import section to insert the new import
        // If react-native-safe-area-context is already imported, avoid duplicate
        if (!content.includes('react-native-safe-area-context')) {
            content = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + content;
        }
    }

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.expo') {
                processDirectory(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

const rootDir = process.argv[2] || '.';
console.log(`Scanning ${rootDir} for SafeAreaView replacements...`);
processDirectory(rootDir);
console.log('Done.');
