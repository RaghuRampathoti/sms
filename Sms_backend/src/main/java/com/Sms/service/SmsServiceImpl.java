package com.Sms.service;

import com.Sms.Dto.*;
import com.Sms.Entity.*;
import com.Sms.Enums.*;
import com.Sms.Repository.*;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmsServiceImpl implements SmsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public User registerUser(SignupRequest signupRequest) {
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        Role roleEnum = Role.valueOf("ROLE_" + signupRequest.getRole().toUpperCase());

        User user = User.builder()
                .username(signupRequest.getUsername())
                .email(signupRequest.getEmail())
                .password(encoder.encode(signupRequest.getPassword()))
                .fullName(signupRequest.getFullName())
                .phoneNumber(signupRequest.getPhoneNumber())
                .role(roleEnum)
                .active(true)
                .build();

        user = userRepository.save(user);

        if (roleEnum == Role.ROLE_TEACHER) {
            Teacher teacher = Teacher.builder()
                    .user(user)
                    .specialization(signupRequest.getSpecialization())
                    .qualification(signupRequest.getQualification())
                    .department(signupRequest.getDepartment())
                    .joiningDate(LocalDate.now())
                    .build();
            teacherRepository.save(teacher);
        } else if (roleEnum == Role.ROLE_STUDENT) {
            SchoolClass schoolClass = null;
            if (signupRequest.getClassId() != null) {
                schoolClass = schoolClassRepository.findById(signupRequest.getClassId())
                        .orElseThrow(() -> new RuntimeException("Error: Class not found."));
            }
            Student student = Student.builder()
                    .user(user)
                    .rollNumber(signupRequest.getRollNumber())
                    .admissionNumber(signupRequest.getAdmissionNumber())
                    .schoolClass(schoolClass)
                    .parentName(signupRequest.getParentName())
                    .parentPhone(signupRequest.getParentPhone())
                    .dateOfBirth(LocalDate.parse(signupRequest.getDateOfBirth()))
                    .build();
            studentRepository.save(student);
        }

        return user;
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Students
    @Override
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    @Override
    public List<Student> findAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student findStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @Override
    public Student findStudentByUsername(String username) {
        return studentRepository.findByUserUsername(username).orElse(null);
    }

    @Override
    public List<Student> findStudentsByClass(Long classId) {
        return studentRepository.findBySchoolClassId(classId);
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    // Teachers
    @Override
    public Teacher saveTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @Override
    public List<Teacher> findAllTeachers() {
        return teacherRepository.findAll();
    }

    @Override
    public Teacher findTeacherById(Long id) {
        return teacherRepository.findById(id).orElse(null);
    }

    @Override
    public Teacher findTeacherByUsername(String username) {
        return teacherRepository.findByUserUsername(username).orElse(null);
    }

    @Override
    public void deleteTeacher(Long id) {
        teacherRepository.deleteById(id);
    }

    // Classes
    @Override
    public SchoolClass saveClass(SchoolClass schoolClass) {
        if (schoolClass.getClassTeacher() != null && schoolClass.getClassTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(schoolClass.getClassTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            schoolClass.setClassTeacher(teacher);
        }
        return schoolClassRepository.save(schoolClass);
    }

    @Override
    public List<SchoolClass> findAllClasses() {
        return schoolClassRepository.findAll();
    }

    @Override
    public SchoolClass findClassById(Long id) {
        return schoolClassRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteClass(Long id) {
        schoolClassRepository.deleteById(id);
    }

    // Subjects
    @Override
    public Subject saveSubject(Subject subject) {
        if (subject.getSchoolClass() != null && subject.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(subject.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            subject.setSchoolClass(sc);
        }
        if (subject.getTeacher() != null && subject.getTeacher().getId() != null) {
            Teacher t = teacherRepository.findById(subject.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            subject.setTeacher(t);
        }
        return subjectRepository.save(subject);
    }

    @Override
    public List<Subject> findAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject findSubjectById(Long id) {
        return subjectRepository.findById(id).orElse(null);
    }

    @Override
    public List<Subject> findSubjectsByClass(Long classId) {
        return subjectRepository.findBySchoolClassId(classId);
    }

    @Override
    public List<Subject> findSubjectsByTeacher(Long teacherId) {
        return subjectRepository.findByTeacherId(teacherId);
    }

    @Override
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }

    // Attendance
    @Override
    @Transactional
    public void saveAttendance(AttendanceRecordDTO record, String recordedByUsername) {
        User recordedBy = userRepository.findByUsername(recordedByUsername).orElse(null);
        SchoolClass sc = schoolClassRepository.findById(record.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));
        Subject subj = null;
        if (record.getSubjectId() != null) {
            subj = subjectRepository.findById(record.getSubjectId()).orElse(null);
        }

        LocalDate date = LocalDate.parse(record.getDate());

        for (AttendanceRecordDTO.StudentAttendance item : record.getRecords()) {
            Student stud = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Attendance> existing = attendanceRepository.findBySchoolClassIdAndSubjectIdAndDateAndPeriod(
                    sc.getId(), subj != null ? subj.getId() : null, date, record.getPeriod());

            Attendance att;
            Optional<Attendance> match = existing.stream().filter(a -> a.getStudent().getId().equals(stud.getId())).findFirst();
            if (match.isPresent()) {
                att = match.get();
                att.setStatus(AttendanceStatus.valueOf(item.getStatus().toUpperCase()));
            } else {
                att = Attendance.builder()
                        .student(stud)
                        .schoolClass(sc)
                        .subject(subj)
                        .date(date)
                        .period(record.getPeriod())
                        .status(AttendanceStatus.valueOf(item.getStatus().toUpperCase()))
                        .recordedBy(recordedBy)
                        .build();
            }
            attendanceRepository.save(att);
        }
    }

    @Override
    public List<Attendance> getAttendance(Long classId, Long subjectId, String date, String period) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceRepository.findBySchoolClassIdAndSubjectIdAndDateAndPeriod(classId, subjectId, localDate, period);
    }

    @Override
    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    public ByteArrayInputStream generateDailyAttendanceReport(Long classId, String date) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Daily Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            SchoolClass sc = schoolClassRepository.findById(classId).orElse(null);
            String className = sc != null ? sc.getClassName() : "Unknown";
            document.add(new Paragraph("Class: " + className));
            document.add(new Paragraph("Date: " + date));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);

            for (String columnTitle : new String[]{"Roll No", "Student Name", "Period", "Status"}) {
                PdfPCell header = new PdfPCell();
                header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                header.setBorderWidth(1);
                header.setPhrase(new Phrase(columnTitle));
                table.addCell(header);
            }

            LocalDate localDate = LocalDate.parse(date);
            List<Attendance> records = attendanceRepository.findBySchoolClassIdAndDate(classId, localDate);

            for (Attendance att : records) {
                table.addCell(att.getStudent().getRollNumber() != null ? att.getStudent().getRollNumber() : "N/A");
                table.addCell(att.getStudent().getUser().getFullName());
                table.addCell(att.getPeriod() != null ? att.getPeriod() : "General");
                table.addCell(att.getStatus().name());
            }

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Override
    public ByteArrayInputStream generateMonthlyAttendanceReport(Long studentId, int month, int year) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Monthly Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Student stud = studentRepository.findById(studentId).orElse(null);
            String studentName = stud != null ? stud.getUser().getFullName() : "Unknown";
            document.add(new Paragraph("Student: " + studentName));
            document.add(new Paragraph("Month/Year: " + month + "/" + year));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);

            for (String columnTitle : new String[]{"Date", "Period", "Status"}) {
                PdfPCell header = new PdfPCell();
                header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                header.setPhrase(new Phrase(columnTitle));
                table.addCell(header);
            }

            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

            List<Attendance> list = attendanceRepository.findByStudentIdAndDateBetween(studentId, start, end);

            for (Attendance att : list) {
                table.addCell(att.getDate().toString());
                table.addCell(att.getPeriod() != null ? att.getPeriod() : "General");
                table.addCell(att.getStatus().name());
            }

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    // Leave Requests
    @Override
    @Transactional
    public LeaveRequest applyLeave(LeaveRequest leaveRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
    public List<LeaveRequest> getLeaveRequestsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return leaveRequestRepository.findByUserId(user.getId());
    }

    @Override
    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String remarks, String reviewerUsername) {
        LeaveRequest req = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        User reviewer = userRepository.findByUsername(reviewerUsername).orElse(null);

        req.setStatus(status);
        req.setReviewRemarks(remarks);
        req.setReviewedBy(reviewer);

        return leaveRequestRepository.save(req);
    }

    // Holiday
    @Override
    public Holiday saveHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    @Override
    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    @Override
    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }

    // Announcement
    @Override
    public Announcement saveAnnouncement(Announcement announcement) {
        announcement.setAnnouncementDate(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    @Override
    public List<Announcement> getAnnouncementsForUser(String username) {
        User u = userRepository.findByUsername(username).orElse(null);
        if (u == null) return Collections.emptyList();

        if (u.getRole() == Role.ROLE_ADMIN) {
            return announcementRepository.findAll();
        } else if (u.getRole() == Role.ROLE_TEACHER) {
            return announcementRepository.findAnnouncementsForUser(Role.ROLE_TEACHER, null);
        } else {
            Student stud = studentRepository.findByUserUsername(username).orElse(null);
            Long classId = stud != null && stud.getSchoolClass() != null ? stud.getSchoolClass().getId() : null;
            return announcementRepository.findAnnouncementsForUser(Role.ROLE_STUDENT, classId);
        }
    }

    @Override
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @Override
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    // Exams
    @Override
    public Exam saveExam(Exam exam) {
        if (exam.getSchoolClass() != null && exam.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(exam.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            exam.setSchoolClass(sc);
        }
        if (exam.getSubject() != null && exam.getSubject().getId() != null) {
            Subject s = subjectRepository.findById(exam.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            exam.setSubject(s);
        }
        return examRepository.save(exam);
    }

    @Override
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @Override
    public List<Exam> getExamsByClass(Long classId) {
        return examRepository.findBySchoolClassId(classId);
    }

    @Override
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    // Results
    @Override
    public Result saveResult(Result result) {
        if (result.getExam() != null && result.getExam().getId() != null) {
            Exam e = examRepository.findById(result.getExam().getId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            result.setExam(e);
        }
        if (result.getStudent() != null && result.getStudent().getId() != null) {
            Student s = studentRepository.findById(result.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            result.setStudent(s);
        }
        return resultRepository.save(result);
    }

    @Override
    public List<Result> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    @Override
    public List<Result> getResultsByStudent(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    @Override
    public void deleteResult(Long id) {
        resultRepository.deleteById(id);
    }

    // Fees
    @Override
    public Fee saveFee(Fee fee) {
        if (fee.getStudent() != null && fee.getStudent().getId() != null) {
            Student s = studentRepository.findById(fee.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            fee.setStudent(s);
        }
        return feeRepository.save(fee);
    }

    @Override
    public List<Fee> getFeesByStudent(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    @Override
    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    @Override
    @Transactional
    public Fee recordFeePayment(Long feeId, Double amount) {
        Fee f = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
        f.setPaidAmount(f.getPaidAmount() + amount);
        if (f.getPaidAmount() >= f.getAmount()) {
            f.setStatus("PAID");
        } else if (f.getPaidAmount() > 0) {
            f.setStatus("PARTIAL");
        } else {
            f.setStatus("UNPAID");
        }
        return feeRepository.save(f);
    }

    // Timetable
    @Override
    public Timetable saveTimetable(Timetable timetable) {
        if (timetable.getSchoolClass() != null && timetable.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(timetable.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            timetable.setSchoolClass(sc);
        }
        if (timetable.getSubject() != null && timetable.getSubject().getId() != null) {
            Subject s = subjectRepository.findById(timetable.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            timetable.setSubject(s);
        }
        if (timetable.getTeacher() != null && timetable.getTeacher().getId() != null) {
            Teacher t = teacherRepository.findById(timetable.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            timetable.setTeacher(t);
        }
        return timetableRepository.save(timetable);
    }

    @Override
    public List<Timetable> getTimetableByClass(Long classId) {
        return timetableRepository.findBySchoolClassId(classId);
    }

    @Override
    public List<Timetable> getTimetableByTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }

    @Override
    public void deleteTimetable(Long id) {
        timetableRepository.deleteById(id);
    }

    // Dashboard
    @Override
    public DashboardStatsDTO getDashboardStats(String username) {
        long students = studentRepository.count();
        long teachers = teacherRepository.count();
        long classes = schoolClassRepository.count();
        long subjects = subjectRepository.count();

        long pendingL = leaveRequestRepository.findByStatus(LeaveStatus.PENDING).size();

        // Calculate today's attendance percent
        List<Attendance> todayRecords = attendanceRepository.findBySchoolClassIdAndDate(1L, LocalDate.now());
        double percentage = 100.0;
        if (!todayRecords.isEmpty()) {
            long present = todayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            percentage = ((double) present / todayRecords.size()) * 100;
        }

        List<Announcement> announcements = getAnnouncementsForUser(username);
        List<Map<String, Object>> recent = announcements.stream().limit(5).map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("content", a.getContent());
            m.put("date", a.getAnnouncementDate().toString());
            return m;
        }).collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalStudents(students)
                .totalTeachers(teachers)
                .totalClasses(classes)
                .totalSubjects(subjects)
                .pendingLeaves(pendingL)
                .todayAttendancePercentage(percentage)
                .recentAnnouncements(recent)
                .build();
    }
}
