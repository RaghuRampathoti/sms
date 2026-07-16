package com.Sms.service;

import com.Sms.Dto.*;

import com.Sms.Entity.*;
import com.Sms.Enums.LeaveStatus;
import java.io.ByteArrayInputStream;
import java.util.List;

public interface SmsService {
    // Auth & Users
    User registerUser(SignupRequest signupRequest);
    User findUserByUsername(String username);
    List<User> findAllUsers();
    
    // Students
    Student saveStudent(Student student);
    List<Student> findAllStudents();
    Student findStudentById(Long id);
    Student findStudentByUsername(String username);
    List<Student> findStudentsByClass(Long classId);
    void deleteStudent(Long id);
    
    // Teachers
    Teacher saveTeacher(Teacher teacher);
    List<Teacher> findAllTeachers();
    Teacher findTeacherById(Long id);
    Teacher findTeacherByUsername(String username);
    void deleteTeacher(Long id);
    
    // Classes
    SchoolClass saveClass(SchoolClass schoolClass);
    List<SchoolClass> findAllClasses();
    SchoolClass findClassById(Long id);
    void deleteClass(Long id);
    
    // Subjects
    Subject saveSubject(Subject subject);
    List<Subject> findAllSubjects();
    Subject findSubjectById(Long id);
    List<Subject> findSubjectsByClass(Long classId);
    List<Subject> findSubjectsByTeacher(Long teacherId);
    void deleteSubject(Long id);
    
    // Attendance
    void saveAttendance(AttendanceRecordDTO record, String recordedByUsername);
    List<Attendance> getAttendance(Long classId, Long subjectId, String date, String period);
    List<Attendance> getStudentAttendance(Long studentId);
    ByteArrayInputStream generateDailyAttendanceReport(Long classId, String date);
    ByteArrayInputStream generateMonthlyAttendanceReport(Long studentId, int month, int year);
    
    // Leave Request
    LeaveRequest applyLeave(LeaveRequest leaveRequest, String username);
    List<LeaveRequest> getAllLeaveRequests();
    List<LeaveRequest> getLeaveRequestsByUser(String username);
    LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String remarks, String reviewerUsername);
    
    // Holiday
    Holiday saveHoliday(Holiday holiday);
    List<Holiday> getAllHolidays();
    void deleteHoliday(Long id);
    
    // Announcement
    Announcement saveAnnouncement(Announcement announcement);
    List<Announcement> getAnnouncementsForUser(String username);
    List<Announcement> getAllAnnouncements();
    void deleteAnnouncement(Long id);
    
    // Exam
    Exam saveExam(Exam exam);
    List<Exam> getAllExams();
    List<Exam> getExamsByClass(Long classId);
    void deleteExam(Long id);
    
    // Result
    Result saveResult(Result result);
    List<Result> getResultsByExam(Long examId);
    List<Result> getResultsByStudent(Long studentId);
    void deleteResult(Long id);
    
    // Fee
    Fee saveFee(Fee fee);
    List<Fee> getFeesByStudent(Long studentId);
    List<Fee> getAllFees();
    Fee recordFeePayment(Long feeId, Double amount);
    
    // Timetable
    Timetable saveTimetable(Timetable timetable);
    List<Timetable> getTimetableByClass(Long classId);
    List<Timetable> getTimetableByTeacher(Long teacherId);
    void deleteTimetable(Long id);
    
    // Dashboard Stats
    DashboardStatsDTO getDashboardStats(String username);
}
