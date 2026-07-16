package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class StudentServiceImpl implements StudentService {
    @Autowired private StudentRepository studentRepository;
    @Override
public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    @Override
public List<Student> findAllStudents() {
        return studentRepository.findAll();
    }

    @Override
public Student findStudentById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @Override
public Student findStudentByUsername(String username) {
        return studentRepository.findByUserUsername(username).orElse(null);
    }

    @Override
public List<Student> findStudentsByClass(Long classId) {
        return studentRepository.findBySchoolClassId(classId);
    }

    @Override
public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

}
