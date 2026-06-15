package com.Sms.config;

import com.Sms.Entity.Student;
import com.Sms.Entity.Teacher;
import com.Sms.Entity.User;
import com.Sms.Enums.Role;
import com.Sms.Repository.StudentRepository;
import com.Sms.Repository.TeacherRepository;
import com.Sms.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedTeacher();
        seedStudent();
    }

    private void seedAdmin() {
        if (userRepository.findByUsername("admin").isPresent()) {
            return;
        }
        User admin = User.builder()
                .username("admin")
                .email("admin@school.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .phoneNumber("9999999999")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("✅ Seeded admin user: admin / admin123");
    }

    private void seedTeacher() {
        if (userRepository.findByUsername("teacher1").isPresent()) {
            return;
        }
        User teacherUser = User.builder()
                .username("teacher1")
                .email("teacher1@school.com")
                .password(passwordEncoder.encode("teacher123"))
                .fullName("John Teacher")
                .phoneNumber("8888888888")
                .role(Role.ROLE_TEACHER)
                .active(true)
                .build();
        teacherUser = userRepository.save(teacherUser);

        Teacher teacher = Teacher.builder()
                .user(teacherUser)
                .specialization("Mathematics")
                .qualification("B.Ed")
                .department("Science")
                .joiningDate(LocalDate.now())
                .build();
        teacherRepository.save(teacher);
        log.info("✅ Seeded teacher user: teacher1 / teacher123");
    }

    private void seedStudent() {
        if (userRepository.findByUsername("student1").isPresent()) {
            return;
        }
        User studentUser = User.builder()
                .username("student1")
                .email("student1@school.com")
                .password(passwordEncoder.encode("student123"))
                .fullName("Jane Student")
                .phoneNumber("7777777777")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        studentUser = userRepository.save(studentUser);

        Student student = Student.builder()
                .user(studentUser)
                .rollNumber("S001")
                .admissionNumber("ADM001")
                .parentName("Parent Name")
                .parentPhone("6666666666")
                .dateOfBirth(LocalDate.of(2005, 1, 15))
                .build();
        studentRepository.save(student);
        log.info("✅ Seeded student user: student1 / student123");
    }
}
