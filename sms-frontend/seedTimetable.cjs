const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

const loginAdmin = async () => {
    const res = await axios.post(`${API_URL}/auth/login`, { username: 'admin', password: 'admin123' });
    return res.data.token;
};

const seed = async () => {
    try {
        console.log('Logging in as Admin...');
        const token = await loginAdmin();
        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching classes and teachers...');
        const classes = (await axios.get(`${API_URL}/classes`, { headers })).data;
        const teachers = (await axios.get(`${API_URL}/teachers`, { headers })).data;

        if (classes.length === 0) {
            console.log('No classes found. Please create at least one class first.');
            return;
        }

        if (teachers.length === 0) {
            console.log('No teachers found. Please create at least one teacher first.');
            return;
        }

        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const subjectNames = ['English', 'Mathematics', 'Science', 'Social Studies', 'History', 'Physics', 'PET'];
        const periods = [
            { no: 1, start: '09:00', end: '10:00' },
            { no: 2, start: '10:00', end: '11:00' },
            { no: 3, start: '11:15', end: '12:15' },
            { no: 4, start: '12:15', end: '13:15' },
            { no: 5, start: '14:00', end: '15:00' },
            { no: 6, start: '15:00', end: '16:00' },
            { no: 7, start: '16:00', end: '17:00' },
        ];

        for (const schoolClass of classes) {
            console.log(`\nProcessing Class: ${schoolClass.className}`);

            // Fetch existing subjects for class
            const existingSubjects = (await axios.get(`${API_URL}/subjects/class/${schoolClass.id}`, { headers })).data;

            // Ensure 7 subjects exist for this class
            const classSubjects = [];
            for (const name of subjectNames) {
                let subject = existingSubjects.find(s => s.subjectName === name);
                if (!subject) {
                    console.log(`Creating missing subject: ${name}`);
                    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                    const res = await axios.post(`${API_URL}/subjects`, {
                        subjectName: name,
                        subjectCode: `${name.substring(0, 3).toUpperCase()}-${schoolClass.id}`,
                        schoolClass: { id: schoolClass.id },
                        teacher: { id: teacher.id }
                    }, { headers });
                    subject = res.data;
                }
                classSubjects.push(subject);
            }

            // Create Timetable for MONDAY to SATURDAY
            console.log('Creating timetable periods...');
            for (const day of days) {
                // To make the timetable look different each day, we rotate the subjects array
                const daySubjects = [...classSubjects];
                const shift = days.indexOf(day);
                for (let i = 0; i < shift; i++) {
                    daySubjects.push(daySubjects.shift());
                }

                for (let i = 0; i < 7; i++) {
                    const subject = daySubjects[i];
                    const period = periods[i];

                    try {
                        await axios.post(`${API_URL}/timetable`, {
                            schoolClass: { id: schoolClass.id },
                            subject: { id: subject.id },
                            teacher: { id: subject.teacher?.id || teachers[0].id },
                            dayOfWeek: day,
                            startTime: period.start,
                            endTime: period.end,
                            periodNo: period.no
                        }, { headers });
                    } catch (e) {
                        // Might already exist or validation error, skip quietly
                    }
                }
            }
            console.log(`✅ Seeded timetable for Class: ${schoolClass.className}`);
        }

        console.log('\nAll done! The timetable is now fully populated.');
    } catch (e) {
        console.error('Error during seeding:', e.response?.data || e.message);
    }
};

seed();
