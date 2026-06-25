package com.Sms.controller;

import com.Sms.Dto.DashboardStatsDTO;
import com.Sms.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard/stats")
    public DashboardStatsDTO getDashboardStats(Principal principal) {
        return dashboardService.getDashboardStats(principal.getName());
    }
}
