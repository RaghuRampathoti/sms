package com.Sms.Dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private long totalSubjects;
    private long pendingLeaves;
    private double todayAttendancePercentage;
    private double teacherAttendancePercentage;
    private List<Map<String, Object>> recentAnnouncements;
}
