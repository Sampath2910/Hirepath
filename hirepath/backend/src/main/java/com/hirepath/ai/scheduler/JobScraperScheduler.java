package com.hirepath.ai.scheduler;

import com.hirepath.ai.model.Job;
import com.hirepath.ai.repository.JobRepository;
import com.hirepath.ai.service.ScraperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.ArrayList;

@Component
public class JobScraperScheduler {

    @Autowired
    private ScraperService scraperService;

    @Autowired
    private JobRepository jobRepository;

    private static final String[] TARGET_ROLES = {
        "Software Engineer", "Frontend Developer", "Backend Engineer", 
        "Full Stack Developer", "Data Scientist", "Java Developer",
        "React Developer", "DevOps Engineer", "Mobile App Developer"
    };

    /**
     * Daily Cron Job: Runs at 6:00 AM every day
     * Format: "second minute hour day month weekday"
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void performDailyJobSync() {
        System.out.println("Starting Daily Automated Job Sync at 6:00 AM...");
        
        for (String role : TARGET_ROLES) {
            try {
                List<Job> dailyJobs = new ArrayList<>();
                
                // Fetch from all integrated platforms
                dailyJobs.addAll(scraperService.scrapeLinkedIn(role, "India"));
                dailyJobs.addAll(scraperService.fetchAdzunaJobs(role, "India"));
                dailyJobs.addAll(scraperService.fetchReedJobs(role));
                dailyJobs.addAll(scraperService.scrapeNaukri(role));
                dailyJobs.addAll(scraperService.scrapeWWR(role));
                dailyJobs.addAll(scraperService.scrapeRemoteOK(role));

                // Deduplicate and save
                int savedCount = 0;
                for (Job job : dailyJobs) {
                    if (jobRepository.findByDedupHash(job.getDedupHash()).isEmpty()) {
                        jobRepository.save(job);
                        savedCount++;
                    }
                }
                System.out.println("Sync completed for role: " + role + " (" + savedCount + " new jobs added)");
            } catch (Exception e) {
                System.err.println("Error syncing jobs for role " + role + ": " + e.getMessage());
            }
        }
        
        System.out.println("Daily Sync Finished Successfully.");
    }

    /**
     * Optional: Warm-up Sync
     * Runs 10 seconds after application startup to ensure database isn't empty
     */
    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE)
    public void initialWarmup() {
        if (jobRepository.count() < 10) {
            System.out.println("Database is empty. Triggering initial job warm-up sync...");
            performDailyJobSync();
        }
    }
}
