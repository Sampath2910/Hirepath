package com.hirepath.ai.controller;

import com.hirepath.ai.model.Application;
import com.hirepath.ai.model.Job;
import com.hirepath.ai.model.User;
import com.hirepath.ai.repository.ApplicationRepository;
import com.hirepath.ai.repository.UserRepository;
import com.hirepath.ai.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIService aiService;

    @PostMapping
    public ResponseEntity<Application> createApplication(@RequestBody Application application) {
        application.setAppliedAt(LocalDateTime.now());
        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getUserApplications(@RequestParam Long userId) {
        return ResponseEntity.ok(applicationRepository.findByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return applicationRepository.findById(id)
                .map(app -> {
                    try {
                        app.setStatus(Application.Status.valueOf(statusUpdate.get("status").toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid status value: " + statusUpdate.get("status"));
                    }
                    return ResponseEntity.ok(applicationRepository.save(app));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/prep")
    public ResponseEntity<List<Map<String, String>>> getInterviewPrep(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(app -> {
                    Job job = app.getJob();
                    User user = app.getUser();
                    String resumeText = user != null ? user.getResumeMasterText() : null;
                    if (resumeText == null) resumeText = "No resume uploaded yet. Please upload a resume first.";
                    return ResponseEntity.ok(aiService.generateInterviewQuestions(job, resumeText));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Real aggregated stats from DB — grouped by userId. Fix BUG 14.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getApplicationStats(@RequestParam Long userId) {
        List<Application> apps = applicationRepository.findByUserId(userId);
        Map<String, Long> result = new HashMap<>();
        result.put("applied", apps.stream().filter(a -> a.getStatus() == Application.Status.APPLIED).count());
        result.put("screening", apps.stream().filter(a -> a.getStatus() == Application.Status.SCREENING).count());
        result.put("interview", apps.stream().filter(a -> a.getStatus() == Application.Status.INTERVIEW).count());
        result.put("offer", apps.stream().filter(a -> a.getStatus() == Application.Status.OFFER).count());
        result.put("rejected", apps.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count());
        result.put("total", (long) apps.size());
        return ResponseEntity.ok(result);
    }
}
