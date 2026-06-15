package com.Sms.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name", unique = true, nullable = false)
    private String className;

    @OneToOne
    @JoinColumn(name = "class_teacher_id", referencedColumnName = "id")
    private Teacher classTeacher;
}
