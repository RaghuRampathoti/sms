package com.Sms.service;

import com.Sms.Dto.*;

import com.Sms.Entity.*;

import java.io.ByteArrayInputStream;
import java.util.*;

public interface AttendanceService {
    void saveAttendance(AttendanceRecordDTO record, String recordedByUsername);
    List<Attendance> getAttendance(Long classId, Long subjectId, String date, String period);
    List<Attendance> getStudentAttendance(Long studentId);
    ByteArrayInputStream generateDailyAttendanceReport(Long classId, String date);
    ByteArrayInputStream generateMonthlyAttendanceReport(Long studentId, int month, int year);
    void saveTeacherAttendance(TeacherAttendanceDTO record, String recordedByUsername);
    List<TeacherAttendance> getTeacherAttendanceByDate(String date);
}
