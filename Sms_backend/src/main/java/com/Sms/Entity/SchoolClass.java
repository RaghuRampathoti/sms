package com.Sms.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_classes", uniqueConstraints = {@UniqueConstraint(columnNames = {"class_name", "academic_year_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name", nullable = false)
    private String className;

    @ManyToOne
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @OneToOne
    @JoinColumn(name = "class_teacher_id", referencedColumnName = "id")
    private Teacher classTeacher;
}
