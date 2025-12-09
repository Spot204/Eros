package com.eros.matchservice.repository;

import com.eros.matchservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByCity(String city);
}
