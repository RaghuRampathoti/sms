package com.Sms.service;

import com.Sms.Dto.PromotionRequestDTO;
import com.Sms.Entity.StudentEnrollment;

import java.util.List;

public interface PromotionService {
    List<StudentEnrollment> getEligibleStudents(Long academicYearId, Long classId);
    void promoteStudents(PromotionRequestDTO requestDTO);
}
