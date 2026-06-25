package com.Sms.Dto;

import lombok.Data;

@Data
public class FeeRequest {
    private Long studentId;
    private Double amount;
    private String dueDate;       // accepted as plain "yyyy-MM-dd" string
    private String description;
}
