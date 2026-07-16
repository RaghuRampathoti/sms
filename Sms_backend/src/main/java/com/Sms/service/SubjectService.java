package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface SubjectService {
    Subject saveSubject(Subject subject);
    List<Subject> findAllSubjects();
    Subject findSubjectById(Long id);
    List<Subject> findSubjectsByClass(Long classId);
    List<Subject> findSubjectsByTeacher(Long teacherId);
    void deleteSubject(Long id);
}
