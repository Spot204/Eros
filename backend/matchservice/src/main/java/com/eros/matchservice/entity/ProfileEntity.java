package com.eros.matchservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;

import java.time.LocalDate;

@Entity
@Table(name = "profiles")
@Data
public class ProfileEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    private String bio;
    private String jobTitle;
    private String company;
    private String education;
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    /**
     * DÙNG GEOGRAPHY — vì DB bạn định nghĩa GEOGRAPHY(POINT, 4326)
     */
    @Column(name = "location", columnDefinition = "GEOGRAPHY(Point, 4326)")
    private Point location;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "is_verified")
    private boolean verified;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
