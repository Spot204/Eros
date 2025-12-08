package com.eros.matchservice.repository;

import com.eros.matchservice.entity.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, Long> {

    @Query("SELECT s FROM Swipe s WHERE s.fromUserId = :fromUser AND s.toUserId = :toUser")
    Swipe findExisting(@Param("fromUser") Long fromUser, @Param("toUser") Long toUser);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM Swipe s WHERE s.fromUserId = :other AND s.toUserId = :me AND s.action = 'LIKE'")
    boolean isMutual(@Param("me") Long me, @Param("other") Long other);
}
