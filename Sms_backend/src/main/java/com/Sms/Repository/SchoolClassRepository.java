package com.Sms.Repository;

import com.Sms.Entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByClassName(String className);
    List<SchoolClass> findByClassNameContainingIgnoreCase(String name);
}
