package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ResultServiceImpl implements ResultService {
    @Autowired private StudentRepository studentRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private ResultRepository resultRepository;
    @Override
public Result saveResult(Result result) {
        if (result.getExam() != null && result.getExam().getId() != null) {
            Exam e = examRepository.findById(result.getExam().getId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            result.setExam(e);
        }
        if (result.getStudent() != null && result.getStudent().getId() != null) {
            Student s = studentRepository.findById(result.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            result.setStudent(s);
        }
        return resultRepository.save(result);
    }

    @Override
public List<Result> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    @Override
public List<Result> getResultsByStudent(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    @Override
public void deleteResult(Long id) {
        resultRepository.deleteById(id);
    }

}
