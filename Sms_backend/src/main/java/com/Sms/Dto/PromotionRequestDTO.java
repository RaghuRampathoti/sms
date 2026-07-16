package com.Sms.Dto;

import lombok.Data;
import java.util.List;

@Data
public class PromotionRequestDTO {
    private Long currentAcademicYearId;
    private Long nextAcademicYearId;
    private Long currentClassId;
    private Long nextClassId;
    private List<Long> promotedStudentIds;
    private List<Long> failedStudentIds;
}
