package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface AnnouncementService {
    Announcement saveAnnouncement(Announcement announcement);
    List<Announcement> getAnnouncementsForUser(String username);
    List<Announcement> getAllAnnouncements();
    void deleteAnnouncement(Long id);
}
