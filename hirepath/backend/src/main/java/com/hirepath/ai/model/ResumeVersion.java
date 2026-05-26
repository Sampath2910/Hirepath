package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private String pdfUrl;
    private Integer atsScore;
    
    @Column(columnDefinition = "TEXT")
    private String keywordsInjected;
    
    @Column(columnDefinition = "LONGTEXT")
    private String tailoredText;
    
    private LocalDateTime createdAt;
}
