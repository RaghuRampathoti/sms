package com.Sms.service;

import com.Sms.Entity.*;
import com.Sms.Enums.*;

import java.util.*;

public interface LeaveService {
    LeaveRequest applyLeave(LeaveRequest leaveRequest, String username);
    List<LeaveRequest> getAllLeaveRequests();
    List<LeaveRequest> getLeaveRequestsByUser(String username);
    LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status, String remarks, String reviewerUsername);
}
