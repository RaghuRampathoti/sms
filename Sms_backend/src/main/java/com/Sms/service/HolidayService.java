package com.Sms.service;

import com.Sms.Entity.*;

import java.util.*;

public interface HolidayService {
    Holiday saveHoliday(Holiday holiday);
    List<Holiday> getAllHolidays();
    void deleteHoliday(Long id);
}
