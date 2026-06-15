package com.Sms.Repository;

import com.Sms.Entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySchoolClassId(Long classId);
    List<Subject> findByTeacherId(Long teacherId);
    Optional<Subject> findBySubjectCode(String subjectCode);
}
