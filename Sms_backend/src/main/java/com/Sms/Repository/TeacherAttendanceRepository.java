package com.Sms.Repository;

import com.Sms.Entity.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {
    List<TeacherAttendance> findByDate(LocalDate date);
    List<TeacherAttendance> findByTeacherId(Long teacherId);
    List<TeacherAttendance> findByTeacherIdAndDateBetween(Long teacherId, LocalDate startDate, LocalDate endDate);
}
