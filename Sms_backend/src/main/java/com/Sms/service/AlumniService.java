package com.Sms.service;

import com.Sms.Entity.Alumni;
import java.util.List;

public interface AlumniService {
    Alumni createAlumni(Alumni alumni);
    List<Alumni> getAllAlumni();
    Alumni getAlumniById(Long id);
    Alumni updateAlumni(Long id, Alumni alumniDetails);
    
    void updateAlumniClassName(String oldName, String newName);

    void deleteAlumni(Long id);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesForAlumni(Long academicYearId, Long classId);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYear(int year);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYearAndClass(int year, String className);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByActiveYearAndClass(String className);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByYearIdAndClass(Long academicYearId, String className);
    List<com.Sms.Dto.AlumniCandidateDto> getCandidatesByDates(java.time.LocalDate startDate, java.time.LocalDate endDate);
    List<Alumni> bulkTransferToAlumni(Long academicYearId, List<Long> studentIds);
}
