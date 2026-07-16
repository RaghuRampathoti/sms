package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface TeacherService {
    Teacher saveTeacher(Teacher teacher);
    List<Teacher> findAllTeachers();
    Teacher findTeacherById(Long id);
    Teacher findTeacherByUsername(String username);
    void deleteTeacher(Long id);
}
