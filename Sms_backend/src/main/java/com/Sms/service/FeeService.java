package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface FeeService {
    Fee saveFee(Fee fee);
    List<Fee> getFeesByStudent(Long studentId);
    List<Fee> getAllFees();
    Fee recordFeePayment(Long feeId, Double amount);
}
