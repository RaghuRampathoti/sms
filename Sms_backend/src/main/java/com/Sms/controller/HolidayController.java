package com.Sms.controller;

import com.Sms.Entity.Holiday;
import com.Sms.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping("/holidays")
    public List<Holiday> getHolidays() {
        return holidayService.getAllHolidays();
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public Holiday createHoliday(@RequestBody Holiday holiday) {
        return holidayService.saveHoliday(holiday);
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHoliday(@PathVariable("id") Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok().build();
    }
}
