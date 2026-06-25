package com.Sms.controller;

import com.Sms.Entity.LeaveRequest;
import com.Sms.Enums.LeaveStatus;
import com.Sms.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping("/leaves")
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leaveRequest, Principal principal) {
        return leaveService.applyLeave(leaveRequest, principal.getName());
    }

    @GetMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<LeaveRequest> getAllLeaves() {
        return leaveService.getAllLeaveRequests();
    }

    @GetMapping("/leaves/my")
    public List<LeaveRequest> getMyLeaves(Principal principal) {
        return leaveService.getLeaveRequestsByUser(principal.getName());
    }

    @PutMapping("/leaves/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveRequest updateLeave(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(name = "remarks", required = false) String remarks,
            Principal principal) {
        return leaveService.updateLeaveStatus(id, LeaveStatus.valueOf(status.toUpperCase()), remarks, principal.getName());
    }
}
