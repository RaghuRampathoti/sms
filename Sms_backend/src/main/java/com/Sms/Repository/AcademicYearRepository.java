package com.Sms.Repository;

import com.Sms.Entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    Optional<AcademicYear> findByActiveTrue();
    List<AcademicYear> findByNameContaining(String name);
    Optional<AcademicYear> findByStartDateAndEndDate(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
