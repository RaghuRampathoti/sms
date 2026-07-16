package com.Sms.Repository;

import com.Sms.Entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySchoolClassId(Long classId);
    List<Timetable> findByTeacherId(Long teacherId);
    List<Timetable> findBySchoolClassIdAndDayOfWeek(Long classId, String dayOfWeek);
    List<Timetable> findBySchoolClassIdAndDayOfWeekAndPeriodNo(Long classId, String dayOfWeek, Integer periodNo);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Timetable t WHERE t.subject.id = :subjectId")
    void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Timetable t WHERE t.schoolClass.id = :classId")
    void deleteBySchoolClassId(@org.springframework.data.repository.query.Param("classId") Long classId);
}
