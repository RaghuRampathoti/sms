package com.Sms.controller;

import com.Sms.Dto.FeeRequest;
import com.Sms.Entity.Fee;
import com.Sms.Entity.Student;
import com.Sms.service.FeeService;
import com.Sms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @Autowired
    private StudentService studentService;

    @GetMapping("/fees")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/fees/student/{studentId}")
    public List<Fee> getStudentFees(@PathVariable("studentId") Long studentId) {
        return feeService.getFeesByStudent(studentId);
    }

    @PostMapping("/fees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFee(@RequestBody FeeRequest req) {
        try {
            Student student = studentService.findStudentById(req.getStudentId());
            if (student == null) {
                return ResponseEntity.badRequest().body("Student not found");
            }
            Fee fee = new Fee();
            fee.setStudent(student);
            fee.setAmount(req.getAmount());
            fee.setDueDate(LocalDate.parse(req.getDueDate()));
            fee.setDescription(req.getDescription());
            fee.setPaidAmount(0.0);
            fee.setStatus("UNPAID");
            return ResponseEntity.ok(feeService.saveFee(fee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create fee: " + e.getMessage());
        }
    }

    @PostMapping("/fees/{id}/pay")
    public Fee payFee(@PathVariable("id") Long id, @RequestParam("amount") Double amount) {
        return feeService.recordFeePayment(id, amount);
    }
}
