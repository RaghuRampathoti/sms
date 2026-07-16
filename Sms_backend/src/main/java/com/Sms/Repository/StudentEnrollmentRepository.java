package com.Sms.Repository;

import com.Sms.Entity.StudentEnrollment;
import com.Sms.Enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, Long> {
    List<StudentEnrollment> findByAcademicYearIdAndSchoolClassIdAndStatus(Long academicYearId, Long classId, EnrollmentStatus status);
    Optional<StudentEnrollment> findByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);
}
