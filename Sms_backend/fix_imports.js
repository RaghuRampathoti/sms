const fs = require('fs');
const path = require('path');

const filesToAddDto = [
    'AttendanceService.java',
    'AttendanceServiceImpl.java',
    'DashboardService.java',
    'DashboardServiceImpl.java',
    'SmsService.java',
    'SmsServiceImpl.java',
    'UserService.java',
    'UserServiceImpl.java'
];

const dir = 'c:/School-management-system/Sms_backend/src/main/java/com/Sms/service';

for (let file of filesToAddDto) {
    let filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('import com.Sms.Dto.*;')) {
            // Insert after package com.Sms.service;
            content = content.replace('package com.Sms.service;', 'package com.Sms.service;\n\nimport com.Sms.Dto.*;');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Added Dto import to ${file}`);
        }
    }
}

// Remove unused PasswordEncoder from all files
const files = fs.readdirSync(dir);
for (let file of files) {
    if (file.endsWith('.java')) {
        let filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('import org.springframework.security.crypto.password.PasswordEncoder;')) {
            // Check if PasswordEncoder is used anywhere else
            let contentWithoutImport = content.replace('import org.springframework.security.crypto.password.PasswordEncoder;', '');
            if (!contentWithoutImport.includes('PasswordEncoder')) {
                content = content.replace(/^import\s+org\.springframework\.security\.crypto\.password\.PasswordEncoder;\s*$/gm, '');
                content = content.replace('\r\n\r\n', '\r\n');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Removed PasswordEncoder from ${file}`);
            }
        }
    }
}

console.log("Fix done.");
