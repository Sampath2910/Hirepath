package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer overallScore; // 0-100
    private String letterGrade; // A/B/C/D
    private Double matchOutOf5;
    
    @Column(columnDefinition = "TEXT")
    private String skillsMatchJson;
    
    @Column(columnDefinition = "TEXT")
    private String aiSummary;
}
