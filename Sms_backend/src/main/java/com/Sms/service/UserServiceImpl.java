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
public class UserServiceImpl implements UserService {

    



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
public User registerUser(SignupRequest signupRequest) {
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        // Auto-generate email from username if not provided
        String email = (signupRequest.getEmail() != null && !signupRequest.getEmail().isBlank())
                ? signupRequest.getEmail()
                : signupRequest.getUsername() + "@school.edu";

        if (userRepository.findByEmail(email).isPresent()) {
            // Make it unique by appending a timestamp
            email = signupRequest.getUsername() + "_" + System.currentTimeMillis() + "@school.edu";
        }

        Role roleEnum = Role.valueOf("ROLE_" + signupRequest.getRole().toUpperCase());

        User user = User.builder()
                .username(signupRequest.getUsername())
                .email(email)
                .fullName(signupRequest.getFullName())
                .phoneNumber(signupRequest.getPhoneNumber())
                .role(roleEnum)
                .active(true)
                .build();

        user = userRepository.save(user);

        if (roleEnum == Role.ROLE_TEACHER) {
            Teacher teacher = Teacher.builder()
                    .user(user)
                    .specialization(signupRequest.getSpecialization())
                    .qualification(signupRequest.getQualification())
                    .department(signupRequest.getDepartment())
                    .joiningDate(LocalDate.now())
                    .build();
            teacherRepository.save(teacher);
        } else if (roleEnum == Role.ROLE_STUDENT) {
            SchoolClass schoolClass = null;
            if (signupRequest.getClassId() != null) {
                schoolClass = schoolClassRepository.findById(signupRequest.getClassId())
                        .orElseThrow(() -> new RuntimeException("Error: Class not found."));
            }
            Student student = Student.builder()
                    .user(user)
                    .rollNumber(signupRequest.getRollNumber())
                    .admissionNumber(signupRequest.getAdmissionNumber())
                    .schoolClass(schoolClass)
                    .parentName(signupRequest.getParentName())
                    .parentPhone(signupRequest.getParentPhone())
                    .dateOfBirth(signupRequest.getDateOfBirth() != null && !signupRequest.getDateOfBirth().isEmpty() ? LocalDate.parse(signupRequest.getDateOfBirth()) : null)
                    .dateOfJoining(signupRequest.getDateOfJoining() != null && !signupRequest.getDateOfJoining().isEmpty() ? LocalDate.parse(signupRequest.getDateOfJoining()) : null)
                    .build();
            studentRepository.save(student);
        }

        return user;
    }

    @Override
public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
public List<User> findAllUsers() {
        return userRepository.findAll();
    }

}
