package com.Sms.Entity;

import com.Sms.Enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "announcement_date", nullable = false)
    private LocalDateTime announcementDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role")
    private Role targetRole;

    @ManyToOne
    @JoinColumn(name = "target_class_id")
    private SchoolClass targetClass;
}
