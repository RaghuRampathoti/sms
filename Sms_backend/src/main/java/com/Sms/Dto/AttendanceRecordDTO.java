package com.Sms.Dto;

import lombok.Data;
import java.util.List;

@Data
public class AttendanceRecordDTO {
    private Long classId;
    private Long subjectId;
    private String period;
    private String date; // yyyy-MM-dd
    private List<StudentAttendance> records;

    @Data
    public static class StudentAttendance {
        private Long studentId;
        private String status; // PRESENT, ABSENT, LEAVE, HOLIDAY
    }
}
