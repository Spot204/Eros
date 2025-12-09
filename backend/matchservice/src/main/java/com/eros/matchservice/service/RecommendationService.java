package com.eros.matchservice.service;

import com.eros.matchservice.dto.UserCardDTO;
import com.eros.matchservice.entity.*;
import com.eros.matchservice.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;
    private final PhotoRepository photoRepo;

    public RecommendationService(UserRepository userRepo,
                                 ProfileRepository profileRepo,
                                 PhotoRepository photoRepo) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.photoRepo = photoRepo;
    }

    public List<UserCardDTO> getRecommendations(Long userId) {
        User me = userRepo.findById(userId).orElse(null);
        if (me == null) return List.of();

        Profile myProfile = profileRepo.findByUserId(userId);
        String myEdu = myProfile != null ? myProfile.getEducation() : null;

        List<User> sameCity = userRepo.findByCity(me.getCity());

        return sameCity.stream()
            .filter(u -> !u.getId().equals(userId))
            .map(u -> buildCard(u, myEdu))
            .collect(Collectors.toList());
    }

    private UserCardDTO buildCard(User user, String myEdu) {
        Profile p = profileRepo.findByUserId(user.getId());
        List<String> photos = photoRepo.findByUserId(user.getId())
                                       .stream().map(Photo::getUrl)
                                       .toList();

        UserCardDTO dto = new UserCardDTO();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.age = user.getAge();
        dto.city = user.getCity();

        if (p != null) {
            dto.bio = p.getBio();
            dto.education = p.getEducation();
            dto.jobTitle = p.getJobTitle();
            dto.company = p.getCompany();
            dto.hobbies = p.getHobbies();
        }

        dto.photos = photos;

        return dto;
    }
}
