package com.Sms.service;

import com.Sms.Entity.*;
import com.Sms.Enums.*;
import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class LeaveServiceImpl implements LeaveService {

    @Autowired private UserRepository userRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Override
    @Transactional
public LeaveRequest applyLeave(LeaveRequest leaveRequest, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
public List<LeaveRequest> getLeaveRequestsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return leaveRequestRepository.findByUserId(user.getId());
    }

    @Override
    @Transactional
public LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String remarks, String reviewerUsername) {
        LeaveRequest req = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        User reviewer = userRepository.findByUsername(reviewerUsername).orElse(null);

        req.setStatus(status);
        req.setReviewRemarks(remarks);
        req.setReviewedBy(reviewer);

        return leaveRequestRepository.save(req);
    }

}
