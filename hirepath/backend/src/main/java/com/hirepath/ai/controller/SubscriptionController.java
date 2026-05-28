package com.hirepath.ai.controller;

import com.hirepath.ai.model.Subscription;
import com.hirepath.ai.model.User;
import com.hirepath.ai.repository.SubscriptionRepository;
import com.hirepath.ai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000}")
public class SubscriptionController {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<Subscription> createSubscription(@RequestBody Subscription subscription) {
        subscription.setStartDate(LocalDateTime.now());
        // Set end date based on plan logic
        subscription.setPaymentStatus("ACTIVE");
        Subscription saved = subscriptionRepository.save(subscription);

        // Sync with User entity planType
        if (subscription.getUser() != null && subscription.getUser().getId() != null) {
            userRepository.findById(subscription.getUser().getId()).ifPresent(user -> {
                try {
                    user.setPlanType(User.PlanType.valueOf(subscription.getPlan().name()));
                    userRepository.save(user);
                } catch (Exception e) {
                    System.err.println("Failed to update user plan type: " + e.getMessage());
                }
            });
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/active")
    public ResponseEntity<Subscription> getActiveSubscription(@RequestParam Long userId) {
        return subscriptionRepository.findFirstByUserIdAndPaymentStatusOrderByEndDateDesc(userId, "ACTIVE")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
