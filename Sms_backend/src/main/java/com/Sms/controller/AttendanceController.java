package com.Sms.controller;

import com.Sms.Dto.AttendanceRecordDTO;
import com.Sms.Entity.Attendance;
import com.Sms.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> saveAttendance(@RequestBody AttendanceRecordDTO record, Principal principal) {
        attendanceService.saveAttendance(record, principal.getName());
        return ResponseEntity.ok("Attendance recorded successfully");
    }

    @GetMapping("/attendance/filter")
    public List<Attendance> getAttendance(
            @RequestParam("classId") Long classId,
            @RequestParam(value = "subjectId", required = false) Long subjectId,
            @RequestParam("date") String date,
            @RequestParam(value = "period", required = false) String period) {
        return attendanceService.getAttendance(classId, subjectId, date, period);
    }

    @GetMapping("/attendance/student/{studentId}")
    public List<Attendance> getStudentAttendance(@PathVariable("studentId") Long studentId) {
        return attendanceService.getStudentAttendance(studentId);
    }

    @GetMapping("/attendance/report/daily")
    public ResponseEntity<InputStreamResource> exportDailyReport(@RequestParam("classId") Long classId, @RequestParam("date") String date) {
        ByteArrayInputStream bis = attendanceService.generateDailyAttendanceReport(classId, date);
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
        ByteArrayInputStream bis = attendanceService.generateMonthlyAttendanceReport(studentId, month, year);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=monthly-attendance.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    // Teacher Attendance
    @PostMapping("/attendance/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveTeacherAttendance(@RequestBody com.Sms.Dto.TeacherAttendanceDTO record, Principal principal) {
        attendanceService.saveTeacherAttendance(record, principal.getName());
        return ResponseEntity.ok("Teacher attendance recorded successfully");
    }

    @GetMapping("/attendance/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public List<com.Sms.Entity.TeacherAttendance> getTeacherAttendance(@RequestParam("date") String date) {
        return attendanceService.getTeacherAttendanceByDate(date);
    }
}
