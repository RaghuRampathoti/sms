package com.Sms.controller;

import com.Sms.Entity.Timetable;
import com.Sms.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    @GetMapping("/timetable/class/{classId}")
    public List<Timetable> getTimetableByClass(@PathVariable("classId") Long classId) {
        return timetableService.getTimetableByClass(classId);
    }

    @GetMapping("/timetable/teacher/{teacherId}")
    public List<Timetable> getTimetableByTeacher(@PathVariable("teacherId") Long teacherId) {
        return timetableService.getTimetableByTeacher(teacherId);
    }

    @PostMapping("/timetable")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Timetable saveTimetable(@RequestBody Timetable timetable) {
        return timetableService.saveTimetable(timetable);
    }

    @DeleteMapping("/timetable/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> deleteTimetable(@PathVariable("id") Long id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/timetable/generate-first-periods/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> generateFirstPeriods(@PathVariable("classId") Long classId) {
        try {
            timetableService.generateFirstPeriodsForClass(classId);
            return ResponseEntity.ok().build();
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }
}
