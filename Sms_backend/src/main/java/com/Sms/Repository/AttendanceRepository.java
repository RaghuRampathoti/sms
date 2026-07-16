package com.Sms.Repository;

import com.Sms.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySchoolClassIdAndSubjectIdAndDateAndPeriod(Long classId, Long subjectId, LocalDate date, String period);
    List<Attendance> findBySchoolClassIdAndDateAndPeriod(Long classId, LocalDate date, String period);
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findBySchoolClassIdAndDate(Long classId, LocalDate date);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Attendance a WHERE a.subject.id = :subjectId")
    void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
