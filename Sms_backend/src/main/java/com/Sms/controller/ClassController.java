package com.Sms.controller;

import com.Sms.Entity.SchoolClass;
import com.Sms.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ClassController {

    @Autowired
    private ClassService classService;

    @GetMapping("/classes")
    public List<SchoolClass> getAllClasses() {
        return classService.findAllClasses();
    }

    @PostMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public SchoolClass createClass(@RequestBody SchoolClass sc) {
        return classService.saveClass(sc);
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SchoolClass updateClass(@PathVariable("id") Long id, @RequestBody SchoolClass sc) {
        SchoolClass existing = classService.findClassById(id);
        if (existing != null) {
            existing.setClassName(sc.getClassName());
            existing.setClassTeacher(sc.getClassTeacher());
            existing.setAcademicYear(sc.getAcademicYear());
            return classService.saveClass(existing);
        }
        return null;
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteClass(@PathVariable("id") Long id) {
        classService.deleteClass(id);
        return ResponseEntity.ok().build();
    }
}
