package com.Sms.controller;

import com.Sms.Entity.Alumni;
import com.Sms.service.AlumniService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.Sms.Dto.BulkAlumniTransferRequest;
import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@CrossOrigin("*")
public class AlumniController {

    @Autowired
    private AlumniService alumniService;

    @GetMapping("/candidates")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidates(@RequestParam Long academicYearId, @RequestParam Long classId) {
        return ResponseEntity.ok(alumniService.getCandidatesForAlumni(academicYearId, classId));
    }

    @GetMapping("/candidates/by-year")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidatesByYear(@RequestParam int year) {
        return ResponseEntity.ok(alumniService.getCandidatesByYear(year));
    }

    @GetMapping("/candidates/by-year-class")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidatesByYearAndClass(
            @RequestParam int year, @RequestParam String className) {
        return ResponseEntity.ok(alumniService.getCandidatesByYearAndClass(year, className));
    }

    @GetMapping("/candidates/by-class")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidatesByActiveYearAndClass(
            @RequestParam String className) {
        return ResponseEntity.ok(alumniService.getCandidatesByActiveYearAndClass(className));
    }

    @GetMapping("/candidates/by-year-id-class")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidatesByYearIdAndClass(
            @RequestParam Long academicYearId, @RequestParam String className) {
        return ResponseEntity.ok(alumniService.getCandidatesByYearIdAndClass(academicYearId, className));
    }

    @GetMapping("/candidates/by-dates")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<com.Sms.Dto.AlumniCandidateDto>> getAlumniCandidatesByDates(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return ResponseEntity.ok(alumniService.getCandidatesByDates(startDate, endDate));
    }

    @PostMapping("/bulk-transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Alumni>> bulkTransferAlumni(@RequestBody BulkAlumniTransferRequest request) {
        return new ResponseEntity<>(alumniService.bulkTransferToAlumni(request.getAcademicYearId(), request.getStudentIds()), HttpStatus.CREATED);
    }

    @PutMapping("/folder/rename")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> renameFolder(@RequestParam String oldName, @RequestParam String newName) {
        alumniService.updateAlumniClassName(oldName, newName);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Alumni>> getAllAlumni() {
        return ResponseEntity.ok(alumniService.getAllAlumni());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Alumni> getAlumniById(@PathVariable Long id) {
        return ResponseEntity.ok(alumniService.getAlumniById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Alumni> createAlumni(@RequestBody Alumni alumni) {
        return new ResponseEntity<>(alumniService.createAlumni(alumni), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Alumni> updateAlumni(@PathVariable Long id, @RequestBody Alumni alumniDetails) {
        return ResponseEntity.ok(alumniService.updateAlumni(id, alumniDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAlumni(@PathVariable Long id) {
        alumniService.deleteAlumni(id);
        return ResponseEntity.noContent().build();
    }
}
