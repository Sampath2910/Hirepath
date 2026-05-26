package com.hirepath.ai.repository;

import com.hirepath.ai.model.JobScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobScoreRepository extends JpaRepository<JobScore, Long> {
    List<JobScore> findByUserId(Long userId);
    Optional<JobScore> findByUserIdAndJobId(Long userId, Long jobId);
}
