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
public class ExamServiceImpl implements ExamService {

    



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

}
