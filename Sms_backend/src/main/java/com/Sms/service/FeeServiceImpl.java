package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class FeeServiceImpl implements FeeService {
    @Autowired private StudentRepository studentRepository;
    @Autowired private FeeRepository feeRepository;
    @Override
public Fee saveFee(Fee fee) {
        if (fee.getStudent() != null && fee.getStudent().getId() != null) {
            Student s = studentRepository.findById(fee.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            fee.setStudent(s);
        }
        return feeRepository.save(fee);
    }

    @Override
public List<Fee> getFeesByStudent(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    @Override
public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    @Override
    @Transactional
public Fee recordFeePayment(Long feeId, Double amount) {
        Fee f = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
        f.setPaidAmount(f.getPaidAmount() + amount);
        if (f.getPaidAmount() >= f.getAmount()) {
            f.setStatus("PAID");
        } else if (f.getPaidAmount() > 0) {
            f.setStatus("PARTIAL");
        } else {
            f.setStatus("UNPAID");
        }
        return feeRepository.save(f);
    }

}
