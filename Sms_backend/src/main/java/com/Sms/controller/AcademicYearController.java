package com.Sms.controller;

import com.Sms.Entity.AcademicYear;
import com.Sms.Repository.AcademicYearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
public class AcademicYearController {

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @GetMapping
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<AcademicYear> createAcademicYear(@RequestBody AcademicYear academicYear) {
        return ResponseEntity.ok(academicYearRepository.save(academicYear));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYear> updateAcademicYear(@PathVariable Long id, @RequestBody AcademicYear updated) {
        return academicYearRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setStartDate(updated.getStartDate());
            existing.setEndDate(updated.getEndDate());
            existing.setActive(updated.getActive());
            return ResponseEntity.ok(academicYearRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable Long id) {
        if(academicYearRepository.existsById(id)) {
            academicYearRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
