package com.Sms.controller;

import com.Sms.Entity.Exam;
import com.Sms.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ExamController {

    @Autowired
    private ExamService examService;

    @GetMapping("/exams")
    public List<Exam> getExams() {
        return examService.getAllExams();
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Exam createExam(@RequestBody Exam exam) {
        return examService.saveExam(exam);
    }

    @GetMapping("/exams/class/{classId}")
    public List<Exam> getExamsByClass(@PathVariable("classId") Long classId) {
        return examService.getExamsByClass(classId);
    }

    @DeleteMapping("/exams/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> deleteExam(@PathVariable("id") Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }
}
