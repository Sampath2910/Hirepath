package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @Enumerated(EnumType.STRING)
    private Status status; // APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED

    private LocalDateTime appliedAt;
    private String resumeVersionUrl;
    private String coverLetterUrl;
    private Integer matchScore;

    public enum Status {
        APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED
    }
}
