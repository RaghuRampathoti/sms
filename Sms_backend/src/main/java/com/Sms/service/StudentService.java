package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface StudentService {
    Student saveStudent(Student student);
    List<Student> findAllStudents();
    Student findStudentById(Long id);
    Student findStudentByUsername(String username);
    List<Student> findStudentsByClass(Long classId);
    void deleteStudent(Long id);
}
