package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private PlanType planType; // FREE, PRO, ELITE

    private String resumeMasterUrl;
    
    @Column(columnDefinition = "TEXT")
    private String resumeMasterText;
    
    private LocalDateTime createdAt;

    public enum PlanType {
        FREE, PRO, ELITE
    }
}
