package com.hirepath.ai.repository;

import com.hirepath.ai.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<Job> findByDedupHash(String dedupHash);
    List<Job> findBySourcePlatform(String platform);
    List<Job> findByTitleContainingIgnoreCaseOrSkillsRequiredContainingIgnoreCase(String title, String skillsRequired);
}
