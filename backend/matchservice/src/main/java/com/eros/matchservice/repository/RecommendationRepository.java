package com.eros.matchservice.repository;

import com.eros.matchservice.entity.ProfileEntity;
import com.eros.matchservice.projection.ProfileProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<ProfileEntity, Long> {

    @Query("""
        SELECT 
            p.userId AS userId,
            p.gender AS gender,
            p.birthDate AS birthDate,
            (DATE_PART('year', AGE(p.birthDate))) AS age,
            pref.interestedIn AS interestedIn,
            pref.ageMin AS ageMin,
            pref.ageMax AS ageMax,
            pref.maxDistanceKm AS maxDistanceKm,
            ST_DistanceSphere(u.location, p.location) / 1000 AS distanceKm
        FROM profiles u
        JOIN preferences pref ON u.userId = pref.userId
        JOIN profiles p ON p.userId != :userId
        WHERE u.userId = :userId
        AND ST_DWithin(u.location, p.location, pref.maxDistanceKm * 1000)
        AND DATE_PART('year', AGE(p.birthDate)) BETWEEN pref.ageMin AND pref.ageMax
        AND (
            pref.interestedIn = 'everyone'
            OR p.gender = pref.interestedIn
        )
        ORDER BY distanceKm
    """)
    List<ProfileProjection> findCandidates(Long userId);
}
