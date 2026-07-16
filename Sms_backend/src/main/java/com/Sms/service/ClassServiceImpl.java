package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClassServiceImpl implements ClassService {
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private AcademicYearRepository academicYearRepository;
    @Override
public SchoolClass saveClass(SchoolClass schoolClass) {
        if (schoolClass.getClassTeacher() != null && schoolClass.getClassTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(schoolClass.getClassTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            schoolClass.setClassTeacher(teacher);
        }
        if (schoolClass.getAcademicYear() != null && schoolClass.getAcademicYear().getId() != null) {
            AcademicYear year = academicYearRepository.findById(schoolClass.getAcademicYear().getId())
                    .orElseThrow(() -> new RuntimeException("Academic Year not found"));
            schoolClass.setAcademicYear(year);
        }
        return schoolClassRepository.save(schoolClass);
    }

    @Override
public List<SchoolClass> findAllClasses() {
        return schoolClassRepository.findAll();
    }

    @Override
public SchoolClass findClassById(Long id) {
        return schoolClassRepository.findById(id).orElse(null);
    }

    @Autowired private TimetableRepository timetableRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteClass(Long id) {
        timetableRepository.deleteBySchoolClassId(id);
        schoolClassRepository.deleteById(id);
    }

}
