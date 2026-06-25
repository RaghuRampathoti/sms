package com.Sms.controller;

import com.Sms.Entity.Result;
import com.Sms.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ResultController {

    @Autowired
    private ResultService resultService;

    @GetMapping("/results/exam/{examId}")
    public List<Result> getResultsByExam(@PathVariable("examId") Long examId) {
        return resultService.getResultsByExam(examId);
    }

    @GetMapping("/results/student/{studentId}")
    public List<Result> getResultsByStudent(@PathVariable("studentId") Long studentId) {
        return resultService.getResultsByStudent(studentId);
    }

    @PostMapping("/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Result createResult(@RequestBody Result result) {
        return resultService.saveResult(result);
    }

    @DeleteMapping("/results/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> deleteResult(@PathVariable("id") Long id) {
        resultService.deleteResult(id);
        return ResponseEntity.ok().build();
    }
}
