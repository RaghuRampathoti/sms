package com.Sms.controller;

import com.Sms.Dto.SignupRequest;
import com.Sms.Entity.Student;
import com.Sms.Entity.User;
import com.Sms.service.StudentService;
import com.Sms.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ClassService classService;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> getAllStudents() {
        return studentService.findAllStudents();
    }

    @GetMapping("/students/{id}")
    public Student getStudentById(@PathVariable("id") Long id) {
        return studentService.findStudentById(id);
    }

    @GetMapping("/students/class/{classId}")
    public List<Student> getStudentsByClass(@PathVariable("classId") Long classId) {
        return studentService.findStudentsByClass(classId);
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Student updateStudent(@PathVariable("id") Long id, @RequestBody SignupRequest request) {
        Student existing = studentService.findStudentById(id);
        if (existing != null) {
            User user = existing.getUser();
            if(request.getFullName() != null) user.setFullName(request.getFullName());
            if(request.getUsername() != null) user.setUsername(request.getUsername());
            if(request.getEmail() != null) user.setEmail(request.getEmail());
            if(request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            
            existing.setRollNumber(request.getRollNumber());
            existing.setAdmissionNumber(request.getAdmissionNumber());
            if (request.getClassId() != null) {
                existing.setSchoolClass(classService.findClassById(request.getClassId()));
            } else {
                existing.setSchoolClass(null);
            }
            existing.setParentName(request.getParentName());
            existing.setParentPhone(request.getParentPhone());
            if(request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
                existing.setDateOfBirth(java.time.LocalDate.parse(request.getDateOfBirth()));
            } else {
                existing.setDateOfBirth(null);
            }
            if(request.getDateOfJoining() != null && !request.getDateOfJoining().isEmpty()) {
                existing.setDateOfJoining(java.time.LocalDate.parse(request.getDateOfJoining()));
            } else {
                existing.setDateOfJoining(null);
            }
            
            return studentService.saveStudent(existing);
        }
        return null;
    }
}
