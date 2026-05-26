package com.hirepath.ai.service;

import com.hirepath.ai.model.Job;
import java.util.List;

public interface ScraperService {
    List<Job> scrapeLinkedIn(String role, String location);
    List<Job> fetchAdzunaJobs(String role, String location);
    List<Job> fetchReedJobs(String role);
    List<Job> scrapeNaukri(String role);
    List<Job> scrapeIndeed(String role, String location);
    List<Job> scrapeWWR(String role);
    List<Job> scrapeRemoteOK(String role);
}
