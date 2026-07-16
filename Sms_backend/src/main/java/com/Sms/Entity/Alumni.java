package com.Sms.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "alumni")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "admission_number", unique = true)
    private String admissionNumber;

    @Column(name = "roll_number")
    private String rollNumber;

    @Column(name = "passing_year", nullable = false)
    private Integer passingYear;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "class_name")
    private String className;
}
