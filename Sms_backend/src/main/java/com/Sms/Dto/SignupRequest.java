package com.Sms.Dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String role; // ADMIN, TEACHER, STUDENT
    
    // Teacher specific fields
    private String specialization;
    private String qualification;
    private String department;

    // Student specific fields
    private String rollNumber;
    private String admissionNumber;
    private Long classId;
    private String parentName;
    private String parentPhone;
    private String dateOfBirth; // yyyy-MM-dd
}
