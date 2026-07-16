const fs = require('fs');
const path = require('path');

const dir = 'c:/School-management-system/Sms_backend/src/main/java/com/Sms/service';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Remove unused imports
    const importRegex = /^import\s+([\w\.]+)\.(\w+);$/gm;
    let imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push({
            fullLine: match[0],
            className: match[2],
            startIndex: match.index,
            endIndex: match.index + match[0].length
        });
    }

    for (let imp of imports) {
        // Count occurrences of className as a whole word
        const regex = new RegExp(`\\b${imp.className}\\b`, 'g');
        const matches = content.match(regex);
        if (matches && matches.length === 1) {
            // Only appears once, which is in the import statement itself
            content = content.replace(imp.fullLine + '\r\n', '');
            content = content.replace(imp.fullLine + '\n', '');
            content = content.replace(imp.fullLine, '');
        }
    }

    // 2. Remove unused Autowired fields
    const autowiredRegex = /^\s*@Autowired\s+(?:private\s+)?(?:org\.springframework\.security\.crypto\.password\.)?(\w+)\s+(\w+);\s*$/gm;
    let fields = [];
    while ((match = autowiredRegex.exec(content)) !== null) {
        fields.push({
            fullLine: match[0],
            type: match[1],
            name: match[2],
            startIndex: match.index,
            endIndex: match.index + match[0].length
        });
    }

    for (let field of fields) {
        const regex = new RegExp(`\\b${field.name}\\b`, 'g');
        const matches = content.match(regex);
        if (matches && matches.length === 1) {
            // Only appears once, which is in the declaration itself
            content = content.replace(field.fullLine + '\r\n', '');
            content = content.replace(field.fullLine + '\n', '');
            content = content.replace(field.fullLine, '');
        }
    }

    // 3. Remove unused wildcard imports (e.g. import com.Sms.Dto.*;)
    // We'll specifically target the ones mentioned in warnings if they aren't used.
    // Actually, wildcard imports might be used. The warnings specifically mention:
    // "The import com.Sms.Dto is never used" which might mean import com.Sms.Dto.*;
    const wildcardRegex = /^import\s+com\.Sms\.Dto\.\*;\s*$/gm;
    if (wildcardRegex.test(content) && !content.includes('Dto')) {
         // This is a bit unsafe, so we'll just leave wildcards alone or handle them if they have no usages of classes from them.
         // Actually, let's just specifically remove com.Sms.Dto.*, com.Sms.Enums.*, com.Sms.Repository.* if their classes aren't used.
         // But how to know if they are used? It's better to just re-compile and see.
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${path.basename(filePath)}`);
    }
}

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (let file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.java')) {
            processFile(fullPath);
        }
    }
}

walkDir(dir);
console.log("Done");
