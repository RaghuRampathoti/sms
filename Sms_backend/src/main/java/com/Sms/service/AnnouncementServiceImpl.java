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
public class AnnouncementServiceImpl implements AnnouncementService {

    



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

}
