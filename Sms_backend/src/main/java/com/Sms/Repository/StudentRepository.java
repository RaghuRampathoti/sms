package com.Sms.Repository;

import com.Sms.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserUsername(String username);
    Optional<Student> findByUserEmail(String email);
    List<Student> findBySchoolClassId(Long classId);
    Optional<Student> findByAdmissionNumber(String admissionNumber);
}
