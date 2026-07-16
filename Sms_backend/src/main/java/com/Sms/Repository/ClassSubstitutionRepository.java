package com.Sms.Repository;

import com.Sms.Entity.ClassSubstitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSubstitutionRepository extends JpaRepository<ClassSubstitution, Long> {
    List<ClassSubstitution> findByDate(LocalDate date);
    Optional<ClassSubstitution> findBySchoolClassIdAndDate(Long classId, LocalDate date);
}
