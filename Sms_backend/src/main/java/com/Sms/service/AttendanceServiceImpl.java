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
public class AttendanceServiceImpl implements AttendanceService {

    



    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private TeacherAttendanceRepository teacherAttendanceRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private HolidayRepository holidayRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private FeeRepository feeRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder encoder;



    @Override
    @Transactional
public void saveAttendance(AttendanceRecordDTO record, String recordedByUsername) {
        User recordedBy = userRepository.findByUsername(recordedByUsername).orElse(null);
        SchoolClass sc = schoolClassRepository.findById(record.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        if ("DAY".equals(record.getPeriod())) {
            if (recordedBy != null && recordedBy.getRole() == Role.ROLE_TEACHER) {
                if (sc.getClassTeacher() == null || !sc.getClassTeacher().getUser().getId().equals(recordedBy.getId())) {
                    throw new RuntimeException("Access Denied: Only the assigned Class Teacher can take Day-wise attendance for this class.");
                }
            }
            // Ensure subject is null for day-wise attendance
            record.setSubjectId(null);
        }

        Subject subj = null;
        if (record.getSubjectId() != null) {
            subj = subjectRepository.findById(record.getSubjectId()).orElse(null);
        }

        LocalDate date = LocalDate.parse(record.getDate());

        for (AttendanceRecordDTO.StudentAttendance item : record.getRecords()) {
            Student stud = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Attendance> existing;
            if ("DAY".equals(record.getPeriod())) {
                existing = attendanceRepository.findBySchoolClassIdAndDateAndPeriod(sc.getId(), date, record.getPeriod());
            } else {
                existing = attendanceRepository.findBySchoolClassIdAndSubjectIdAndDateAndPeriod(
                        sc.getId(), subj != null ? subj.getId() : null, date, record.getPeriod());
            }

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
        if ("DAY".equals(period)) {
            return attendanceRepository.findBySchoolClassIdAndDateAndPeriod(classId, localDate, period);
        }
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

    @Override
    @Transactional
public void saveTeacherAttendance(TeacherAttendanceDTO record, String recordedByUsername) {
        User recordedBy = userRepository.findByUsername(recordedByUsername).orElse(null);
        LocalDate date = LocalDate.parse(record.getDate());

        for (TeacherAttendanceDTO.TeacherAttendanceRecord item : record.getRecords()) {
            Teacher teacher = teacherRepository.findById(item.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            List<TeacherAttendance> existing = teacherAttendanceRepository.findByDate(date);
            Optional<TeacherAttendance> match = existing.stream().filter(a -> a.getTeacher().getId().equals(teacher.getId())).findFirst();

            TeacherAttendance att;
            if (match.isPresent()) {
                att = match.get();
                att.setStatus(com.Sms.Enums.AttendanceStatus.valueOf(item.getStatus().toUpperCase()));
            } else {
                att = TeacherAttendance.builder()
                        .teacher(teacher)
                        .date(date)
                        .status(com.Sms.Enums.AttendanceStatus.valueOf(item.getStatus().toUpperCase()))
                        .recordedBy(recordedBy)
                        .build();
            }
            teacherAttendanceRepository.save(att);
        }
    }

    @Override
public List<TeacherAttendance> getTeacherAttendanceByDate(String date) {
        return teacherAttendanceRepository.findByDate(LocalDate.parse(date));
    }

}
