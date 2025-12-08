package com.eros.matchservice.service;

import java.util.List;

public interface RecommendationService {
    List<Long> recommend(Long userId);
}
