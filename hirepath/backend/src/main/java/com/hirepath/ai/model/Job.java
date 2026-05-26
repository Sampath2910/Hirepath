package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String company;
    private String location;
    private String url;
    private String sourcePlatform; // Wellfound, LinkedIn, etc.
    private String postedSource; // Naukri.com, GeeksForGeeks
    
    @Enumerated(EnumType.STRING)
    private JobType jobType; // REMOTE, ONSITE, HYBRID
    
    @Enumerated(EnumType.STRING)
    private JobCategory category; // REMOTE, OFF_CAMPUS, WALK_IN, FRESHERS, INTERNSHIP

    private String salaryRange;
    private String experienceRequired;
    private Boolean freshersOk;
    
    private LocalDate walkInDate;
    private String walkInTime;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String skillsRequired;
    
    private LocalDateTime postedAt;
    
    @Column(unique = true)
    private String dedupHash;

    public enum JobType {
        REMOTE, ONSITE, HYBRID
    }
    
    public enum JobCategory {
        REMOTE, OFF_CAMPUS, WALK_IN, FRESHERS, INTERNSHIP
    }
}
