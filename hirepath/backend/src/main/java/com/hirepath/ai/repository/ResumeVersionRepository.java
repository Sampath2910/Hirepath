package com.hirepath.ai.repository;

import com.hirepath.ai.model.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    List<ResumeVersion> findByUserId(Long userId);
    Optional<ResumeVersion> findByUserIdAndJobId(Long userId, Long jobId);
}
