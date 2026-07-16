const fs = require('fs');
const path = require('path');

const dir = 'c:/School-management-system/Sms_backend/src/main/java/com/Sms/service';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Unused com.Sms.Dto.*
    if (content.includes('import com.Sms.Dto.*;')) {
        // We assume Dto classes end with 'Dto'
        // Let's strip the import string itself and check if 'Dto' appears
        let contentWithoutImport = content.replace('import com.Sms.Dto.*;', '');
        if (!contentWithoutImport.includes('Dto')) {
            content = content.replace(/^import\s+com\.Sms\.Dto\.\*;\s*$/gm, '');
            content = content.replace('\r\n\r\n', '\r\n');
        }
    }

    // 2. Unused com.Sms.Enums.*
    if (content.includes('import com.Sms.Enums.*;')) {
        let contentWithoutImport = content.replace('import com.Sms.Enums.*;', '');
        if (!contentWithoutImport.includes('AttendanceStatus') && 
            !contentWithoutImport.includes('LeaveStatus') && 
            !contentWithoutImport.includes('Role')) {
            content = content.replace(/^import\s+com\.Sms\.Enums\.\*;\s*$/gm, '');
            content = content.replace('\r\n\r\n', '\r\n');
        }
    }

    // 3. Unused com.Sms.Repository.*
    if (content.includes('import com.Sms.Repository.*;')) {
        let contentWithoutImport = content.replace('import com.Sms.Repository.*;', '');
        if (!contentWithoutImport.includes('Repository')) {
            content = content.replace(/^import\s+com\.Sms\.Repository\.\*;\s*$/gm, '');
            content = content.replace('\r\n\r\n', '\r\n');
        }
    }

    if (content !== originalContent) {
        // Fix empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated wildcards in ${path.basename(filePath)}`);
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
