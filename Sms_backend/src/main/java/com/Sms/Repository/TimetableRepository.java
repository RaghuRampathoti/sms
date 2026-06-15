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
}
