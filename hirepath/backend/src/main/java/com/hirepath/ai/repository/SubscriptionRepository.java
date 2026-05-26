package com.hirepath.ai.repository;

import com.hirepath.ai.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserId(Long userId);

    Optional<Subscription> findFirstByUserIdAndPaymentStatusOrderByEndDateDesc(Long userId, String paymentStatus);
}
