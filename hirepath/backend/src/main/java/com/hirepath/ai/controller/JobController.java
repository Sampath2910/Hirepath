package com.hirepath.ai.controller;

import com.hirepath.ai.model.Job;
import com.hirepath.ai.model.JobScore;
import com.hirepath.ai.repository.JobRepository;
import com.hirepath.ai.repository.JobScoreRepository;
import com.hirepath.ai.service.ScraperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000}")
public class JobController {

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private JobScoreRepository jobScoreRepository;

    @Autowired
    private ScraperService scraperService;

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchAndScrape(@RequestParam String role, @RequestParam(defaultValue = "India") String location) {
        // 1. Fetch existing matching jobs from local DB first to ensure we have fallback data
        List<Job> existingJobs = jobRepository.findByTitleContainingIgnoreCaseOrSkillsRequiredContainingIgnoreCase(role, role);
        List<Job> allJobs = new java.util.ArrayList<>(existingJobs);

        // 2. Parallelize scraping tasks using CompletableFuture to prevent request timeouts
        // Run Playwright scrapers on a single-threaded executor to prevent RAM overload (max 1 Chromium instance at a time)
        java.util.concurrent.ExecutorService playwrightExecutor = java.util.concurrent.Executors.newSingleThreadExecutor();

        java.util.concurrent.CompletableFuture<List<Job>> linkedInFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.scrapeLinkedIn(role, location), playwrightExecutor);
        java.util.concurrent.CompletableFuture<List<Job>> naukriFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.scrapeNaukri(role), playwrightExecutor);
        java.util.concurrent.CompletableFuture<List<Job>> wwrFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.scrapeWWR(role), playwrightExecutor);
        java.util.concurrent.CompletableFuture<List<Job>> remoteOkFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.scrapeRemoteOK(role), playwrightExecutor);
        java.util.concurrent.CompletableFuture<List<Job>> adzunaFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.fetchAdzunaJobs(role, location));
        java.util.concurrent.CompletableFuture<List<Job>> reedFuture = java.util.concurrent.CompletableFuture.supplyAsync(() -> scraperService.fetchReedJobs(role));

        // Wait for all to complete, capping at 12 seconds max
        try {
            java.util.concurrent.CompletableFuture.allOf(linkedInFuture, naukriFuture, wwrFuture, remoteOkFuture, adzunaFuture, reedFuture)
                .orTimeout(12, java.util.concurrent.TimeUnit.SECONDS)
                .handle((ok, err) -> null)
                .join();
        } catch (Exception e) {
            System.err.println("Parallel scraping timeout or interruption: " + e.getMessage());
        } finally {
            playwrightExecutor.shutdownNow();
        }

        List<Job> scrapedJobs = new ArrayList<>();
        try { scrapedJobs.addAll(linkedInFuture.getNow(List.of())); } catch (Exception e) {}
        try { scrapedJobs.addAll(naukriFuture.getNow(List.of())); } catch (Exception e) {}
        try { scrapedJobs.addAll(wwrFuture.getNow(List.of())); } catch (Exception e) {}
        try { scrapedJobs.addAll(remoteOkFuture.getNow(List.of())); } catch (Exception e) {}
        try { scrapedJobs.addAll(adzunaFuture.getNow(List.of())); } catch (Exception e) {}
        try { scrapedJobs.addAll(reedFuture.getNow(List.of())); } catch (Exception e) {}

        // Save unique jobs to DB and add to results if not already present
        for (Job job : scrapedJobs) {
            if (job.getDedupHash() == null) continue;
            boolean existsInDb = jobRepository.findByDedupHash(job.getDedupHash()).isPresent();
            if (!existsInDb) {
                try {
                    jobRepository.save(job);
                } catch (Exception se) {
                    System.err.println("Error saving scraped job: " + se.getMessage());
                }
            }
            
            // Check if it's already in our local listing to avoid duplicates
            boolean alreadyListed = allJobs.stream().anyMatch(j -> job.getDedupHash().equals(j.getDedupHash()));
            if (!alreadyListed) {
                allJobs.add(job);
            }
        }

        return ResponseEntity.ok(allJobs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobDetails(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/score")
    public ResponseEntity<JobScore> getJobScore(@PathVariable Long id, @RequestParam Long userId) {
        return jobScoreRepository.findByUserIdAndJobId(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/scraped")
    public Job saveScrapedJob(@RequestBody Job job) {
        return jobRepository.findByDedupHash(job.getDedupHash())
                .orElseGet(() -> jobRepository.save(job));
    }
}
