package com.Sms.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "class_substitutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSubstitution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "substitute_teacher_id", nullable = false)
    private Teacher substituteTeacher;

    @Column(nullable = false)
    private LocalDate date;
}
