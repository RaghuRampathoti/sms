package com.Sms.service;

import com.Sms.Dto.PromotionRequestDTO;
import com.Sms.Entity.AcademicYear;
import com.Sms.Entity.SchoolClass;
import com.Sms.Entity.StudentEnrollment;
import com.Sms.Enums.EnrollmentStatus;
import com.Sms.Repository.AcademicYearRepository;
import com.Sms.Repository.SchoolClassRepository;
import com.Sms.Repository.StudentEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private StudentEnrollmentRepository studentEnrollmentRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private com.Sms.Repository.StudentRepository studentRepository;

    @Override
    public List<StudentEnrollment> getEligibleStudents(Long academicYearId, Long classId) {
        List<StudentEnrollment> enrollments = studentEnrollmentRepository.findByAcademicYearIdAndSchoolClassIdAndStatus(
                academicYearId, classId, EnrollmentStatus.ACTIVE);

        if (enrollments.isEmpty()) {
            AcademicYear year = academicYearRepository.findById(academicYearId).orElse(null);
            if (year != null) {
                List<com.Sms.Entity.Student> students = studentRepository.findBySchoolClassId(classId);
                for (com.Sms.Entity.Student student : students) {
                    if (student.getUser() != null && student.getUser().isActive()) {
                        StudentEnrollment newEnrollment = StudentEnrollment.builder()
                                .student(student)
                                .academicYear(year)
                                .schoolClass(student.getSchoolClass())
                                .rollNumber(student.getRollNumber())
                                .status(EnrollmentStatus.ACTIVE)
                                .promotionDate(LocalDate.now())
                                .build();
                        studentEnrollmentRepository.save(newEnrollment);
                        enrollments.add(newEnrollment);
                    }
                }
            }
        }
        return enrollments;
    }

    @Override
    @Transactional
    public void promoteStudents(PromotionRequestDTO requestDTO) {
        AcademicYear nextYear = academicYearRepository.findById(requestDTO.getNextAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Next academic year not found"));

        SchoolClass nextClass = schoolClassRepository.findById(requestDTO.getNextClassId())
                .orElseThrow(() -> new RuntimeException("Next class not found"));
                
        SchoolClass currentClass = schoolClassRepository.findById(requestDTO.getCurrentClassId())
                .orElseThrow(() -> new RuntimeException("Current class not found"));

        if (requestDTO.getPromotedStudentIds() != null) {
            for (Long enrollmentId : requestDTO.getPromotedStudentIds()) {
                StudentEnrollment currentEnrollment = studentEnrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));
                
                if (!currentEnrollment.getSchoolClass().getId().equals(currentClass.getId())) {
                     throw new RuntimeException("Student does not belong to the selected current class.");
                }
                
                currentEnrollment.setStatus(EnrollmentStatus.PROMOTED);
                studentEnrollmentRepository.save(currentEnrollment);

                StudentEnrollment newEnrollment = StudentEnrollment.builder()
                        .student(currentEnrollment.getStudent())
                        .academicYear(nextYear)
                        .schoolClass(nextClass)
                        .rollNumber(currentEnrollment.getRollNumber())
                        .status(EnrollmentStatus.ACTIVE)
                        .promotionDate(LocalDate.now())
                        .build();
                studentEnrollmentRepository.save(newEnrollment);
            }
        }

        if (requestDTO.getFailedStudentIds() != null) {
            for (Long enrollmentId : requestDTO.getFailedStudentIds()) {
                StudentEnrollment currentEnrollment = studentEnrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() -> new RuntimeException("Enrollment not found: " + enrollmentId));
                
                currentEnrollment.setStatus(EnrollmentStatus.FAILED);
                studentEnrollmentRepository.save(currentEnrollment);

                StudentEnrollment newEnrollment = StudentEnrollment.builder()
                        .student(currentEnrollment.getStudent())
                        .academicYear(nextYear)
                        .schoolClass(currentEnrollment.getSchoolClass())
                        .rollNumber(currentEnrollment.getRollNumber())
                        .status(EnrollmentStatus.FAILED) // Or ACTIVE for the same class in new year? The req says "new StudentEnrollment record for the next academic year with status FAILED."
                        .promotionDate(LocalDate.now())
                        .build();
                studentEnrollmentRepository.save(newEnrollment);
            }
        }
        
        // Mark previous academic year as inactive as per user request
        AcademicYear currentYear = academicYearRepository.findById(requestDTO.getCurrentAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Current academic year not found"));
        currentYear.setActive(false);
        academicYearRepository.save(currentYear);
        
        nextYear.setActive(true);
        academicYearRepository.save(nextYear);
    }
}
