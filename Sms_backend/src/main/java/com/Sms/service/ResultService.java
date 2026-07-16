package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface ResultService {
    Result saveResult(Result result);
    List<Result> getResultsByExam(Long examId);
    List<Result> getResultsByStudent(Long studentId);
    void deleteResult(Long id);
}
