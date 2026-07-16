package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface ClassService {
    SchoolClass saveClass(SchoolClass schoolClass);
    List<SchoolClass> findAllClasses();
    SchoolClass findClassById(Long id);
    void deleteClass(Long id);
}
