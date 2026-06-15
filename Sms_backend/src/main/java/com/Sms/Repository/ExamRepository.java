package com.Sms.Repository;

import com.Sms.Entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySchoolClassId(Long classId);
    List<Exam> findBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
}
