package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ExamServiceImpl implements ExamService {
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private ExamRepository examRepository;
    @Override
public Exam saveExam(Exam exam) {
        if (exam.getSchoolClass() != null && exam.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(exam.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            exam.setSchoolClass(sc);
        }
        if (exam.getSubject() != null && exam.getSubject().getId() != null) {
            Subject s = subjectRepository.findById(exam.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            exam.setSubject(s);
        }
        return examRepository.save(exam);
    }

    @Override
public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @Override
public List<Exam> getExamsByClass(Long classId) {
        return examRepository.findBySchoolClassId(classId);
    }

    @Override
public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

}
