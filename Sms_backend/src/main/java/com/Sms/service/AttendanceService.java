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

public interface AttendanceService {
    void saveAttendance(AttendanceRecordDTO record, String recordedByUsername);
    List<Attendance> getAttendance(Long classId, Long subjectId, String date, String period);
    List<Attendance> getStudentAttendance(Long studentId);
    ByteArrayInputStream generateDailyAttendanceReport(Long classId, String date);
    ByteArrayInputStream generateMonthlyAttendanceReport(Long studentId, int month, int year);
    void saveTeacherAttendance(TeacherAttendanceDTO record, String recordedByUsername);
    List<TeacherAttendance> getTeacherAttendanceByDate(String date);
}
