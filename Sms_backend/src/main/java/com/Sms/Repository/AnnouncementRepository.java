package com.Sms.Repository;

import com.Sms.Entity.Announcement;
import com.Sms.Enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByTargetRole(Role role);

    @Query("SELECT a FROM Announcement a WHERE a.targetRole = :role OR a.targetClass.id = :classId OR (a.targetRole IS NULL AND a.targetClass IS NULL) ORDER BY a.announcementDate DESC")
    List<Announcement> findAnnouncementsForUser(@Param("role") Role role, @Param("classId") Long classId);

    @Query("SELECT a FROM Announcement a WHERE a.targetRole IS NULL AND a.targetClass IS NULL ORDER BY a.announcementDate DESC")
    List<Announcement> findAllGlobal();
}
