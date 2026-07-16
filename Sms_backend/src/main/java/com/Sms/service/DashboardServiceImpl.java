package com.Sms.service;

import com.Sms.Dto.*;

import com.Sms.Entity.*;
import com.Sms.Enums.*;
import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private TeacherAttendanceRepository teacherAttendanceRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private AnnouncementService announcementService;

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

        // Calculate today's teacher attendance percent
        List<TeacherAttendance> todayTeacherRecords = teacherAttendanceRepository.findByDate(LocalDate.now());
        double teacherPercentage = 100.0;
        if (!todayTeacherRecords.isEmpty()) {
            long present = todayTeacherRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            teacherPercentage = ((double) present / todayTeacherRecords.size()) * 100;
        }

        List<Announcement> announcements = announcementService.getAnnouncementsForUser(username);
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
                .teacherAttendancePercentage(teacherPercentage)
                .recentAnnouncements(recent)
                .build();
    }

}
