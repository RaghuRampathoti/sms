package com.Sms.Repository;

import com.Sms.Entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySchoolClassId(Long classId);
    List<Exam> findBySchoolClassIdAndSubjectId(Long classId, Long subjectId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Exam e WHERE e.subject.id = :subjectId")
    void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
