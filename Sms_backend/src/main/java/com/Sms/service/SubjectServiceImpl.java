package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SubjectServiceImpl implements SubjectService {
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Override
public Subject saveSubject(Subject subject) {
        if (subject.getSchoolClass() != null && subject.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(subject.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            subject.setSchoolClass(sc);
        }
        if (subject.getTeacher() != null && subject.getTeacher().getId() != null) {
            Teacher t = teacherRepository.findById(subject.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            subject.setTeacher(t);
        }
        return subjectRepository.save(subject);
    }

    @Override
public List<Subject> findAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
public Subject findSubjectById(Long id) {
        return subjectRepository.findById(id).orElse(null);
    }

    @Override
public List<Subject> findSubjectsByClass(Long classId) {
        return subjectRepository.findBySchoolClassId(classId);
    }

    @Override
public List<Subject> findSubjectsByTeacher(Long teacherId) {
        return subjectRepository.findByTeacherId(teacherId);
    }

    @Autowired private TimetableRepository timetableRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private ExamRepository examRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteSubject(Long id) {
        timetableRepository.deleteBySubjectId(id);
        attendanceRepository.deleteBySubjectId(id);
        resultRepository.deleteBySubjectId(id);
        examRepository.deleteBySubjectId(id);
        subjectRepository.deleteById(id);
    }

}
