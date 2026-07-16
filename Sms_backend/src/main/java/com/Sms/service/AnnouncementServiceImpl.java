package com.Sms.service;

import com.Sms.Entity.*;
import com.Sms.Enums.*;
import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Override
public Announcement saveAnnouncement(Announcement announcement) {
        announcement.setAnnouncementDate(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    @Override
public List<Announcement> getAnnouncementsForUser(String username) {
        User u = userRepository.findByUsername(username).orElse(null);
        if (u == null) return Collections.emptyList();

        if (u.getRole() == Role.ROLE_ADMIN) {
            return announcementRepository.findAll();
        } else if (u.getRole() == Role.ROLE_TEACHER) {
            return announcementRepository.findAnnouncementsForUser(Role.ROLE_TEACHER, null);
        } else {
            Student stud = studentRepository.findByUserUsername(username).orElse(null);
            Long classId = stud != null && stud.getSchoolClass() != null ? stud.getSchoolClass().getId() : null;
            return announcementRepository.findAnnouncementsForUser(Role.ROLE_STUDENT, classId);
        }
    }

    @Override
public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    @Override
public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

}
