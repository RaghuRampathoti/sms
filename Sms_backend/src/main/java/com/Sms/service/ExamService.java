package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface ExamService {
    Exam saveExam(Exam exam);
    List<Exam> getAllExams();
    List<Exam> getExamsByClass(Long classId);
    void deleteExam(Long id);
}
