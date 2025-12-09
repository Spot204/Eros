package com.eros.matchservice.repository;

import com.eros.matchservice.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByUserId(Long userId);
} 
