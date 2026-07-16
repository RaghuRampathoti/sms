package com.Sms.Repository;

import com.Sms.Entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByExamId(Long examId);
    List<Result> findByStudentId(Long studentId);
    List<Result> findByExamIdAndStudentId(Long examId, Long studentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Result r WHERE r.exam.subject.id = :subjectId")
    void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
