package com.Sms.Dto;

import lombok.Data;
import java.util.List;

@Data
public class TeacherAttendanceDTO {
    private String date;
    private List<TeacherAttendanceRecord> records;

    @Data
    public static class TeacherAttendanceRecord {
        private Long teacherId;
        private String status;
    }
}
