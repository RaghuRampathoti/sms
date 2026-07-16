package com.Sms.Repository;

import com.Sms.Entity.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    Optional<Alumni> findByAdmissionNumber(String admissionNumber);
    java.util.List<Alumni> findByClassName(String className);
    java.util.List<Alumni> findByClassNameIsNull();
}
