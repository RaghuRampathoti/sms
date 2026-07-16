package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TimetableServiceImpl implements TimetableService {
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private SchoolClassRepository schoolClassRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Override
public Timetable saveTimetable(Timetable timetable) {
        if (timetable.getSchoolClass() != null && timetable.getSchoolClass().getId() != null) {
            SchoolClass sc = schoolClassRepository.findById(timetable.getSchoolClass().getId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            timetable.setSchoolClass(sc);
        }
        if (timetable.getSubject() != null && timetable.getSubject().getId() != null) {
            Subject s = subjectRepository.findById(timetable.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            timetable.setSubject(s);
        }
        if (timetable.getTeacher() != null && timetable.getTeacher().getId() != null) {
            Teacher t = teacherRepository.findById(timetable.getTeacher().getId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            timetable.setTeacher(t);
        }
        return timetableRepository.save(timetable);
    }

    @Override
public List<Timetable> getTimetableByClass(Long classId) {
        return timetableRepository.findBySchoolClassId(classId);
    }

    @Override
public List<Timetable> getTimetableByTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }

    @Override
    public void deleteTimetable(Long id) {
        timetableRepository.deleteById(id);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void generateFirstPeriodsForClass(Long classId) {
        SchoolClass sc = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Teacher classTeacher = sc.getClassTeacher();
        if (classTeacher == null) {
            throw new RuntimeException("No class teacher assigned to this class");
        }

        List<Subject> subjects = subjectRepository.findBySchoolClassId(classId);
        Subject subject = subjects.stream()
                .filter(s -> s.getTeacher() != null && s.getTeacher().getId().equals(classTeacher.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Class teacher does not have any assigned subject for this class"));

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};

        for (String day : days) {
            List<Timetable> existing = timetableRepository.findBySchoolClassIdAndDayOfWeekAndPeriodNo(classId, day, 1);
            if (existing != null && !existing.isEmpty()) {
                timetableRepository.deleteAll(existing);
            }

            Timetable t = Timetable.builder()
                    .schoolClass(sc)
                    .teacher(classTeacher)
                    .subject(subject)
                    .dayOfWeek(day)
                    .periodNo(1)
                    .startTime("09:00")
                    .endTime("10:00")
                    .build();
            timetableRepository.save(t);
        }
    }

}
