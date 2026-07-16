package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TeacherServiceImpl implements TeacherService {
    @Autowired private TeacherRepository teacherRepository;
    @Override
public Teacher saveTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @Override
public List<Teacher> findAllTeachers() {
        return teacherRepository.findAll();
    }

    @Override
public Teacher findTeacherById(Long id) {
        return teacherRepository.findById(id).orElse(null);
    }

    @Override
public Teacher findTeacherByUsername(String username) {
        return teacherRepository.findByUserUsername(username).orElse(null);
    }

    @Override
public void deleteTeacher(Long id) {
        teacherRepository.deleteById(id);
    }

}
