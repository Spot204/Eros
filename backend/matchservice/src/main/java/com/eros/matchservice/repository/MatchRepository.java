package com.eros.matchservice.repository;

import com.eros.matchservice.entity.MatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<MatchEntity, Long> {

    /**
     * Kiểm tra có match giữa 2 user bất kể thứ tự không
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
           "FROM MatchEntity m " +
           "WHERE (m.user1Id = :u1 AND m.user2Id = :u2) OR (m.user1Id = :u2 AND m.user2Id = :u1)")
    boolean existsByUsers(@Param("u1") Long u1, @Param("u2") Long u2);

    List<MatchEntity> findAllByUser1IdOrUser2Id(Long userId1, Long userId2);
}
