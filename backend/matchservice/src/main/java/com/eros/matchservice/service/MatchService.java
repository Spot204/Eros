package com.eros.matchservice.service;

import com.eros.matchservice.entity.MatchEntity;
import com.eros.matchservice.entity.Swipe;
import com.eros.matchservice.repository.MatchRepository;
import com.eros.matchservice.repository.SwipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final SwipeRepository swipeRepo;
    private final MatchRepository matchRepo;

    public boolean swipe(Long fromUser, Long toUser, String action) {

        if (!action.equals("LIKE") && !action.equals("PASS")) {
            throw new RuntimeException("Invalid action");
        }

        // ❌ Không cho vuốt trùng
        Swipe existing = swipeRepo.findExisting(fromUser, toUser);
        if (existing != null) return false;

        // ✔ Lưu swipe
        Swipe s = new Swipe();
        s.setFromUserId(fromUser);
        s.setToUserId(toUser);
        s.setAction(action);
        swipeRepo.save(s);

        // Nếu không LIKE → không kiểm mutual
        if (!"LIKE".equals(action)) return false;

        // ✔ Kiểm tra mutual LIKE
        boolean isMutual = swipeRepo.isMutual(fromUser, toUser);

        if (isMutual) {

            // Không cho tạo match trùng
            boolean alreadyMatched = matchRepo.existsByUsers(fromUser, toUser);
            if (!alreadyMatched) {
                MatchEntity m = new MatchEntity();
                m.setUser1Id(fromUser);
                m.setUser2Id(toUser);
                matchRepo.save(m);
            }

            return true;
        }

        return false;
    }
}
