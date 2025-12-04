package com.eros.matchservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "swipes")
@Data
public class Swipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "swipe_id")
    private Long swipeId;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId;

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId;

    @Column(name = "action", nullable = false, length = 10)
    private String action;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
