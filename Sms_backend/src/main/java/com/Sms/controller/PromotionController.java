package com.Sms.controller;

import com.Sms.Dto.PromotionRequestDTO;
import com.Sms.Entity.StudentEnrollment;
import com.Sms.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping("/eligible")
    public ResponseEntity<List<StudentEnrollment>> getEligibleStudents(
            @RequestParam Long academicYearId,
            @RequestParam Long classId) {
        List<StudentEnrollment> eligibleStudents = promotionService.getEligibleStudents(academicYearId, classId);
        return ResponseEntity.ok(eligibleStudents);
    }

    @PostMapping("/promote")
    public ResponseEntity<String> promoteStudents(@RequestBody PromotionRequestDTO requestDTO) {
        try {
            promotionService.promoteStudents(requestDTO);
            return ResponseEntity.ok("Promotion process completed successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Promotion failed: " + e.getMessage());
        }
    }
}
