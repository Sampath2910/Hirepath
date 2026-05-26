package com.hirepath.ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private User.PlanType plan; // FREE, PRO, ELITE

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    private String paymentStatus; // e.g. ACTIVE, EXPIRED, CANCELLED
}
