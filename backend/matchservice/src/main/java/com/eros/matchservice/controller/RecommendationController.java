package com.eros.matchservice.controller;

import com.eros.matchservice.dto.UserCardDTO;
import com.eros.matchservice.service.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommend")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService service;

    public RecommendationController(RecommendationService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<UserCardDTO> get(@PathVariable Long userId) {
        return service.getRecommendations(userId);
    }
}
