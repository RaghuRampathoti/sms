package com.Sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumniCandidateDto {
    private Long studentId;
    private String fullName;
    private String admissionNumber;
    private String rollNumber;
    private String className;
    private String academicYear;
}
