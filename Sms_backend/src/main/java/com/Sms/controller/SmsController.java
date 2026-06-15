package com.Sms.controller;

import com.Sms.Dto.*;
import com.Sms.Entity.*;
import com.Sms.Enums.LeaveStatus;
import com.Sms.Security.JwtUtils;
import com.Sms.service.SmsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class SmsController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SmsService smsService;

    // Authentication Endpoints
    @PostMapping("/auth/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        com.Sms.Security.UserDetailsImpl userDetails = (com.Sms.Security.UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role));
    }

    @PostMapping("/auth/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            User registered = smsService.registerUser(signUpRequest);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Students
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> getAllStudents() {
        return smsService.findAllStudents();
    }

    @GetMapping("/students/{id}")
    public Student getStudentById(@PathVariable("id") Long id) {
        return smsService.findStudentById(id);
    }

    @GetMapping("/students/class/{classId}")
    public List<Student> getStudentsByClass(@PathVariable("classId") Long classId) {
        return smsService.findStudentsByClass(classId);
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") Long id) {
        smsService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Student updateStudent(@PathVariable("id") Long id, @RequestBody SignupRequest request) {
        Student existing = smsService.findStudentById(id);
        if (existing != null) {
            User user = existing.getUser();
            if(request.getFullName() != null) user.setFullName(request.getFullName());
            if(request.getUsername() != null) user.setUsername(request.getUsername());
            if(request.getEmail() != null) user.setEmail(request.getEmail());
            if(request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            
            existing.setRollNumber(request.getRollNumber());
            existing.setAdmissionNumber(request.getAdmissionNumber());
            if (request.getClassId() != null) {
                existing.setSchoolClass(smsService.findClassById(request.getClassId()));
            } else {
                existing.setSchoolClass(null);
            }
            existing.setParentName(request.getParentName());
            existing.setParentPhone(request.getParentPhone());
            if(request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
                existing.setDateOfBirth(java.time.LocalDate.parse(request.getDateOfBirth()));
            } else {
                existing.setDateOfBirth(null);
            }
            
            return smsService.saveStudent(existing);
        }
        return null;
    }

    // Teachers
    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Teacher> getAllTeachers() {
        return smsService.findAllTeachers();
    }

    @GetMapping("/teachers/{id}")
    public Teacher getTeacherById(@PathVariable("id") Long id) {
        // Fetch teacher by ID
        return smsService.findTeacherById(id);
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTeacher(@PathVariable("id") Long id) {
        smsService.deleteTeacher(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Teacher updateTeacher(@PathVariable("id") Long id, @RequestBody SignupRequest request) {
        Teacher existing = smsService.findTeacherById(id);
        if (existing != null) {
            User user = existing.getUser();
            if(request.getFullName() != null) user.setFullName(request.getFullName());
            if(request.getUsername() != null) user.setUsername(request.getUsername());
            if(request.getEmail() != null) user.setEmail(request.getEmail());
            if(request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            
            existing.setSpecialization(request.getSpecialization());
            existing.setQualification(request.getQualification());
            existing.setDepartment(request.getDepartment());
            
            return smsService.saveTeacher(existing);
        }
        return null;
    }

    // Classes
    @GetMapping("/classes")
    public List<SchoolClass> getAllClasses() {
        return smsService.findAllClasses();
    }

    @PostMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public SchoolClass createClass(@RequestBody SchoolClass sc) {
        return smsService.saveClass(sc);
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SchoolClass updateClass(@PathVariable("id") Long id, @RequestBody SchoolClass sc) {
        SchoolClass existing = smsService.findClassById(id);
        if (existing != null) {
            existing.setClassName(sc.getClassName());
            existing.setClassTeacher(sc.getClassTeacher());
            return smsService.saveClass(existing);
        }
        return null;
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteClass(@PathVariable("id") Long id) {
        smsService.deleteClass(id);
        return ResponseEntity.ok().build();
    }

    // Subjects
    @GetMapping("/subjects")
    public List<Subject> getAllSubjects() {
        return smsService.findAllSubjects();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject createSubject(@RequestBody Subject subject) {
        return smsService.saveSubject(subject);
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject updateSubject(@PathVariable("id") Long id, @RequestBody Subject subject) {
        Subject existing = smsService.findSubjectById(id);
        if (existing != null) {
            existing.setSubjectName(subject.getSubjectName());
            existing.setSubjectCode(subject.getSubjectCode());
            existing.setSchoolClass(subject.getSchoolClass());
            existing.setTeacher(subject.getTeacher());
            return smsService.saveSubject(existing);
        }
        return null;
    }

    @GetMapping("/subjects/class/{classId}")
    public List<Subject> getSubjectsByClass(@PathVariable("classId") Long classId) {
        return smsService.findSubjectsByClass(classId);
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable("id") Long id) {
        smsService.deleteSubject(id);
        return ResponseEntity.ok().build();
    }

    // Attendance
    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> saveAttendance(@RequestBody AttendanceRecordDTO record, Principal principal) {
        smsService.saveAttendance(record, principal.getName());
        return ResponseEntity.ok("Attendance recorded successfully");
    }

    @GetMapping("/attendance/filter")
    public List<Attendance> getAttendance(
            @RequestParam("classId") Long classId,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("date") String date,
            @RequestParam("period") String period) {
        return smsService.getAttendance(classId, subjectId, date, period);
    }

    @GetMapping("/attendance/student/{studentId}")
    public List<Attendance> getStudentAttendance(@PathVariable("studentId") Long studentId) {
        return smsService.getStudentAttendance(studentId);
    }

    @GetMapping("/attendance/report/daily")
    public ResponseEntity<InputStreamResource> exportDailyReport(@RequestParam("classId") Long classId, @RequestParam("date") String date) {
        ByteArrayInputStream bis = smsService.generateDailyAttendanceReport(classId, date);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=daily-attendance.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/attendance/report/monthly")
    public ResponseEntity<InputStreamResource> exportMonthlyReport(
            @RequestParam("studentId") Long studentId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        ByteArrayInputStream bis = smsService.generateMonthlyAttendanceReport(studentId, month, year);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=monthly-attendance.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    // Leave requests
    @PostMapping("/leaves")
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leaveRequest, Principal principal) {
        return smsService.applyLeave(leaveRequest, principal.getName());
    }

    @GetMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<LeaveRequest> getAllLeaves() {
        return smsService.getAllLeaveRequests();
    }

    @GetMapping("/leaves/my")
    public List<LeaveRequest> getMyLeaves(Principal principal) {
        return smsService.getLeaveRequestsByUser(principal.getName());
    }

    @PutMapping("/leaves/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveRequest updateLeave(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(name = "remarks", required = false) String remarks,
            Principal principal) {
        return smsService.updateLeaveStatus(id, LeaveStatus.valueOf(status.toUpperCase()), remarks, principal.getName());
    }

    // Holidays
    @GetMapping("/holidays")
    public List<Holiday> getHolidays() {
        return smsService.getAllHolidays();
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public Holiday createHoliday(@RequestBody Holiday holiday) {
        return smsService.saveHoliday(holiday);
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHoliday(@PathVariable("id") Long id) {
        smsService.deleteHoliday(id);
        return ResponseEntity.ok().build();
    }

    // Announcements
    @GetMapping("/announcements")
    public List<Announcement> getAnnouncements(Principal principal) {
        return smsService.getAnnouncementsForUser(principal.getName());
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        return smsService.saveAnnouncement(announcement);
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable("id") Long id) {
        smsService.deleteAnnouncement(id);
        return ResponseEntity.ok().build();
    }

    // Exams
    @GetMapping("/exams")
    public List<Exam> getExams() {
        return smsService.getAllExams();
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Exam createExam(@RequestBody Exam exam) {
        return smsService.saveExam(exam);
    }

    @GetMapping("/exams/class/{classId}")
    public List<Exam> getExamsByClass(@PathVariable("classId") Long classId) {
        return smsService.getExamsByClass(classId);
    }

    @DeleteMapping("/exams/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> deleteExam(@PathVariable("id") Long id) {
        smsService.deleteExam(id);
        return ResponseEntity.ok().build();
    }

    // Results
    @GetMapping("/results/exam/{examId}")
    public List<Result> getResultsByExam(@PathVariable("examId") Long examId) {
        return smsService.getResultsByExam(examId);
    }

    @GetMapping("/results/student/{studentId}")
    public List<Result> getResultsByStudent(@PathVariable("studentId") Long studentId) {
        return smsService.getResultsByStudent(studentId);
    }

    @PostMapping("/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Result createResult(@RequestBody Result result) {
        return smsService.saveResult(result);
    }

    @DeleteMapping("/results/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> deleteResult(@PathVariable("id") Long id) {
        smsService.deleteResult(id);
        return ResponseEntity.ok().build();
    }

    // Fees
    @GetMapping("/fees")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Fee> getAllFees() {
        return smsService.getAllFees();
    }

    @GetMapping("/fees/student/{studentId}")
    public List<Fee> getStudentFees(@PathVariable("studentId") Long studentId) {
        return smsService.getFeesByStudent(studentId);
    }

    @PostMapping("/fees")
    @PreAuthorize("hasRole('ADMIN')")
    public Fee createFee(@RequestBody Fee fee) {
        return smsService.saveFee(fee);
    }

    @PostMapping("/fees/{id}/pay")
    public Fee payFee(@PathVariable("id") Long id, @RequestParam("amount") Double amount) {
        return smsService.recordFeePayment(id, amount);
    }

    // Timetable
    @GetMapping("/timetable/class/{classId}")
    public List<Timetable> getTimetableByClass(@PathVariable("classId") Long classId) {
        return smsService.getTimetableByClass(classId);
    }

    @GetMapping("/timetable/teacher/{teacherId}")
    public List<Timetable> getTimetableByTeacher(@PathVariable("teacherId") Long teacherId) {
        return smsService.getTimetableByTeacher(teacherId);
    }

    @PostMapping("/timetable")
    @PreAuthorize("hasRole('ADMIN')")
    public Timetable saveTimetable(@RequestBody Timetable timetable) {
        return smsService.saveTimetable(timetable);
    }

    @DeleteMapping("/timetable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTimetable(@PathVariable("id") Long id) {
        smsService.deleteTimetable(id);
        return ResponseEntity.ok().build();
    }

    // Dashboard Stats
    @GetMapping("/dashboard/stats")
    public DashboardStatsDTO getDashboardStats(Principal principal) {
        return smsService.getDashboardStats(principal.getName());
    }
}
