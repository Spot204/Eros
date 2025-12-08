package com.eros.matchservice.controller;

import com.eros.matchservice.service.MatchService;
import com.eros.matchservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final RecommendationService recommendationService;

    @GetMapping("/recommend/{userId}")
    public List<Long> recommend(@PathVariable Long userId) {
        return recommendationService.recommend(userId);
    }

    @PostMapping("/swipe")
    public boolean swipe(
            @RequestParam Long fromUserId,
            @RequestParam Long toUserId,
            @RequestParam String action
    ) {
        return matchService.swipe(fromUserId, toUserId, action);
    }
}
