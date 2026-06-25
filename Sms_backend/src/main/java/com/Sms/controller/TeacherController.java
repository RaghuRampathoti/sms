package com.Sms.controller;

import com.Sms.Dto.SignupRequest;
import com.Sms.Entity.Teacher;
import com.Sms.Entity.User;
import com.Sms.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<Teacher> getAllTeachers() {
        return teacherService.findAllTeachers();
    }

    @GetMapping("/teachers/{id}")
    public Teacher getTeacherById(@PathVariable("id") Long id) {
        return teacherService.findTeacherById(id);
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTeacher(@PathVariable("id") Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Teacher updateTeacher(@PathVariable("id") Long id, @RequestBody SignupRequest request) {
        Teacher existing = teacherService.findTeacherById(id);
        if (existing != null) {
            User user = existing.getUser();
            if(request.getFullName() != null) user.setFullName(request.getFullName());
            if(request.getUsername() != null) user.setUsername(request.getUsername());
            if(request.getEmail() != null) user.setEmail(request.getEmail());
            if(request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            
            existing.setSpecialization(request.getSpecialization());
            existing.setQualification(request.getQualification());
            existing.setDepartment(request.getDepartment());
            
            return teacherService.saveTeacher(existing);
        }
        return null;
    }
}
