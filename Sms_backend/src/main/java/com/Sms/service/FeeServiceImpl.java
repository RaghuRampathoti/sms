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
public class FeeServiceImpl implements FeeService {

    



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

}
