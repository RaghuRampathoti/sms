package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface TimetableService {
    Timetable saveTimetable(Timetable timetable);
    List<Timetable> getTimetableByClass(Long classId);
    List<Timetable> getTimetableByTeacher(Long teacherId);
    void deleteTimetable(Long id);
    void generateFirstPeriodsForClass(Long classId);
}
