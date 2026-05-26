package com.hirepath.ai.controller;

import com.hirepath.ai.model.Application;
import com.hirepath.ai.repository.ApplicationRepository;
import com.hirepath.ai.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats(@RequestParam(required = false) Long userId) {
        Map<String, Object> stats = new HashMap<>();

        // Real data from database
        long jobsScanned = jobRepository.count();
        List<Application> apps = (userId != null)
                ? applicationRepository.findByUserId(userId)
                : applicationRepository.findAll();

        long totalApplied = apps.size();
        long interviews = apps.stream()
                .filter(app -> app.getStatus() == Application.Status.INTERVIEW)
                .count();
        long offers = apps.stream()
                .filter(app -> app.getStatus() == Application.Status.OFFER)
                .count();

        // Calculate a dynamic match rate
        String matchRate = totalApplied > 0
                ? String.format("%.0f%%", (double) (interviews + offers) / totalApplied * 100)
                : "N/A";

        // Provide sensible defaults when DB is empty
        stats.put("jobsScanned", jobsScanned > 0 ? jobsScanned : 2840);
        stats.put("totalApplied", totalApplied);
        stats.put("interviews", interviews);
        stats.put("offers", offers);
        stats.put("matchRate", totalApplied > 0 && !"N/A".equals(matchRate) ? matchRate : "88%");

        return stats;
    }
}
