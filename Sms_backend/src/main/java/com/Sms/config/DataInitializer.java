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
        if (userRepository.findByUsername("admin").isPresent() || userRepository.findByEmail("admin@school.com").isPresent()) {
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
        String[] specializations = {"Mathematics", "Science", "English", "History", "Physics", "Chemistry"};
        String[] departments = {"Science", "Science", "Languages", "Social Studies", "Science", "Science"};
        String[] qualifications = {"B.Ed", "M.Sc", "M.A.", "B.A.", "Ph.D.", "M.Sc"};
        String[] names = {"John Teacher", "Sarah Science", "Emma English", "Henry History", "Paul Physics", "Claire Chemistry"};

        for (int i = 1; i <= 6; i++) {
            String username = "teacher" + i;
            String email = username + "@school.com";
            if (userRepository.findByUsername(username).isPresent() || userRepository.findByEmail(email).isPresent()) {
                continue;
            }
            User teacherUser = User.builder()
                    .username(username)
                    .email(username + "@school.com")
                    .password(passwordEncoder.encode("teacher123"))
                    .fullName(names[i-1])
                    .phoneNumber("888888888" + i)
                    .role(Role.ROLE_TEACHER)
                    .active(true)
                    .build();

            Teacher teacher = Teacher.builder()
                    .user(teacherUser)
                    .specialization(specializations[i-1])
                    .qualification(qualifications[i-1])
                    .department(departments[i-1])
                    .joiningDate(LocalDate.now().minusYears(1).plusMonths(i))
                    .build();
            teacherRepository.save(teacher);
            log.info("✅ Seeded teacher user: {} / teacher123", username);
        }
    }

    private void seedStudent() {
        String[] firstNames = {"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                               "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
                               "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"};

        for (int i = 1; i <= 30; i++) {
            String username = "student" + i;
            String email = username + "@school.com";
            if (userRepository.findByUsername(username).isPresent() || userRepository.findByEmail(email).isPresent()) {
                continue;
            }
            String fullName = firstNames[i-1] + " " + lastNames[i-1];
            User studentUser = User.builder()
                    .username(username)
                    .email(username + "@school.com")
                    .password(passwordEncoder.encode("student123"))
                    .fullName(fullName)
                    .phoneNumber("77777777" + String.format("%02d", i))
                    .role(Role.ROLE_STUDENT)
                    .active(true)
                    .build();

            Student student = Student.builder()
                    .user(studentUser)
                    .rollNumber(String.format("S%03d", i))
                    .admissionNumber(String.format("ADM%03d", i))
                    .parentName("Parent of " + firstNames[i-1])
                    .parentPhone("66666666" + String.format("%02d", i))
                    .dateOfBirth(LocalDate.of(2005 + (i % 5), 1 + (i % 12), 1 + (i % 28)))
                    .build();
            studentRepository.save(student);
            log.info("✅ Seeded student user: {} / student123", username);
        }
    }
}
