package com.Sms.controller;

import com.Sms.Entity.Subject;
import com.Sms.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping("/subjects")
    public List<Subject> getAllSubjects() {
        return subjectService.findAllSubjects();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectService.saveSubject(subject);
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject updateSubject(@PathVariable("id") Long id, @RequestBody Subject subject) {
        Subject existing = subjectService.findSubjectById(id);
        if (existing != null) {
            existing.setSubjectName(subject.getSubjectName());
            existing.setSubjectCode(subject.getSubjectCode());
            existing.setSchoolClass(subject.getSchoolClass());
            existing.setTeacher(subject.getTeacher());
            return subjectService.saveSubject(existing);
        }
        return null;
    }

    @GetMapping("/subjects/class/{classId}")
    public List<Subject> getSubjectsByClass(@PathVariable("classId") Long classId) {
        return subjectService.findSubjectsByClass(classId);
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable("id") Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok().build();
    }
}
