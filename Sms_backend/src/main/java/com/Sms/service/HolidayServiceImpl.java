package com.Sms.service;

import com.Sms.Entity.*;

import com.Sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class HolidayServiceImpl implements HolidayService {
    @Autowired private HolidayRepository holidayRepository;
    @Override
public Holiday saveHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    @Override
public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    @Override
public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }

}
