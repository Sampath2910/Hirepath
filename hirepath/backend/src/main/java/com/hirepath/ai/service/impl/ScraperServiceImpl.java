package com.hirepath.ai.service.impl;

import com.microsoft.playwright.*;
import com.hirepath.ai.model.Job;
import com.hirepath.ai.service.ScraperService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ScraperServiceImpl implements ScraperService {

    private final WebClient webClient;

    @Value("${adzuna.app.id}")
    private String adzunaAppId;

    @Value("${adzuna.app.key}")
    private String adzunaAppKey;

    @Value("${reed.api.key}")
    private String reedApiKey;

    public ScraperServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * BUG 6 FIX: Playwright requires browser binaries. If not installed, this catches
     * the error gracefully and returns an empty list instead of crashing the whole request.
     * To install: mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install chromium"
     */
    private Playwright createPlaywright() {
        return Playwright.create();
    }

    @Override
    public List<Job> scrapeLinkedIn(String role, String location) {
        List<Job> jobs = new ArrayList<>();
        try (Playwright playwright = createPlaywright()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of(
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-dev-shm-usage"
                )));

            BrowserContext context = browser.newContext(new Browser.NewContextOptions()
                .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"));

            Page page = context.newPage();

            // LinkedIn public job search (no login required for listing)
            String url = String.format(
                "https://www.linkedin.com/jobs/search?keywords=%s&location=%s&f_TPR=r86400&position=1&pageNum=0",
                role.replace(" ", "%20"), location.replace(" ", "%20"));

            page.navigate(url);
            page.waitForTimeout(3000);

            // BUG 7 NOTE: LinkedIn may block — we handle this gracefully
            Locator jobCards = page.locator(".jobs-search__results-list li");
            int count = Math.min(jobCards.count(), 10);

            for (int i = 0; i < count; i++) {
                try {
                    Locator card = jobCards.nth(i);
                    String title = card.locator(".base-search-card__title").innerText().trim();
                    String company = card.locator(".base-search-card__subtitle").innerText().trim();
                    String jobUrl = card.locator("a.base-card__full-link").getAttribute("href");
                    if (jobUrl == null) jobUrl = "https://linkedin.com/jobs";
                    
                    // Try to extract description and metadata from the listing
                    String jobLocation = location;
                    String description = "";
                    try { jobLocation = card.locator(".job-search-card__location").innerText().trim(); } catch (Exception ignore) {}
                    try { 
                        String criteria = card.locator(".base-search-card__metadata").innerText().trim();
                        description = "Job Type: " + criteria;
                    } catch (Exception ignore) {}

                    jobs.add(Job.builder()
                            .title(title)
                            .company(company)
                            .location(jobLocation)
                            .url(jobUrl)
                            .sourcePlatform("LinkedIn")
                            .jobType(Job.JobType.REMOTE)
                            .description(description.isEmpty() ? "Apply on LinkedIn for full job description." : description)
                            .dedupHash(UUID.nameUUIDFromBytes(jobUrl.getBytes()).toString())
                            .build());
                } catch (Exception e) {
                    System.err.println("Skipping LinkedIn card " + i + ": " + e.getMessage());
                }
            }
            browser.close();
        } catch (Exception e) {
            System.err.println("LinkedIn scrape error (possibly blocked or Playwright not installed): " + e.getMessage());
        }
        return jobs;
    }

    @Override
    public List<Job> fetchAdzunaJobs(String role, String location) {
        if (adzunaAppId == null || adzunaAppId.isBlank() || "YOUR_ADZUNA_ID".equals(adzunaAppId)) {
            return new ArrayList<>();
        }

        try {
            // Use 'in' (India) as country code for the Indian job market
            String countryCode = location.toLowerCase().contains("uk") || location.toLowerCase().contains("united kingdom") ? "gb" : "in";
            String url = String.format(
                "https://api.adzuna.com/v1/api/jobs/%s/search/1?app_id=%s&app_key=%s&what=%s&where=%s&content-type=application/json&results_per_page=10",
                countryCode, adzunaAppId, adzunaAppKey,
                role.replace(" ", "%20"), location.replace(" ", "%20"));

            Map<String, Object> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.get("results") != null) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                List<Job> jobs = new ArrayList<>();
                for (Map<String, Object> res : results) {
                    try {
                        String id = String.valueOf(res.get("id"));
                        String title = (String) res.get("title");
                        String company = res.get("company") != null
                                ? (String) ((Map<?, ?>) res.get("company")).get("display_name")
                                : "Unknown Company";
                        String jobUrl = (String) res.get("redirect_url");
                        String loc = res.get("location") != null
                                ? (String) ((Map<?, ?>) res.get("location")).get("display_name")
                                : location;

                        // Try to extract salary and description if provided by Adzuna
                        String salaryRange = "";
                        try {
                            Object smin = res.get("salary_min");
                            Object smax = res.get("salary_max");
                            if (smin != null || smax != null) {
                                String sminStr = smin != null ? String.valueOf(smin) : "";
                                String smaxStr = smax != null ? String.valueOf(smax) : "";
                                if (!sminStr.isEmpty() && !smaxStr.isEmpty()) salaryRange = sminStr + " - " + smaxStr;
                                else salaryRange = sminStr + smaxStr;
                            } else if (res.get("salary") != null) {
                                salaryRange = String.valueOf(res.get("salary"));
                            }
                        } catch (Exception ignore) {}

                        String description = null;
                        try {
                            if (res.get("description") != null) description = (String) res.get("description");
                        } catch (Exception ignore) {}

                        jobs.add(Job.builder()
                            .title(title)
                            .company(company)
                            .url(jobUrl)
                            .location(loc)
                            .salaryRange(salaryRange)
                            .description(description)
                            .sourcePlatform("Adzuna")
                            .jobType(Job.JobType.REMOTE)
                            .dedupHash(UUID.nameUUIDFromBytes(id.getBytes()).toString())
                            .build());
                    } catch (Exception e) {
                        System.err.println("Skipping Adzuna result: " + e.getMessage());
                    }
                }
                return jobs;
            }
        } catch (Exception e) {
            System.err.println("Adzuna API error: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    @Override
    public List<Job> fetchReedJobs(String role) {
        // Reed.co.uk is UK-only. BUG 16 FIX: Skip if not configured for UK use.
        if (reedApiKey == null || reedApiKey.isBlank() || "YOUR_REED_KEY".equals(reedApiKey)) {
            return new ArrayList<>();
        }

        try {
            String url = "https://www.reed.co.uk/api/1.0/search?keywords=" + role.replace(" ", "%20") + "&resultsToTake=10";

            Map<String, Object> response = webClient.get()
                .uri(url)
                .headers(headers -> headers.setBasicAuth(reedApiKey, ""))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.get("results") != null) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
                List<Job> jobs = new ArrayList<>();
                for (Map<String, Object> res : results) {
                    try {
                        Object jobIdObj = res.get("jobId");
                        String dedup = UUID.nameUUIDFromBytes(String.valueOf(jobIdObj).getBytes()).toString();
                        jobs.add(Job.builder()
                            .title((String) res.get("jobTitle"))
                            .company((String) res.get("employerName"))
                            .url((String) res.get("jobUrl"))
                            .location((String) res.get("locationName"))
                            .sourcePlatform("Reed.co.uk")
                            .jobType(Job.JobType.ONSITE)
                            .dedupHash(dedup)
                            .build());
                    } catch (Exception e) {
                        System.err.println("Skipping Reed result: " + e.getMessage());
                    }
                }
                return jobs;
            }
        } catch (Exception e) {
            System.err.println("Reed API error: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    /**
     * BUG 8 FIX: Updated Naukri.com CSS selectors to match current 2024-2025 layout.
     * BUG 18 FIX: Added per-card try-catch so one bad card doesn't crash the whole scrape.
     */
    @Override
    public List<Job> scrapeNaukri(String role) {
        List<Job> jobs = new ArrayList<>();
        try (Playwright playwright = createPlaywright()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of("--no-sandbox", "--disable-dev-shm-usage")));
            Page page = browser.newPage();
            // Updated URL format for Naukri
            String url = "https://www.naukri.com/" + role.toLowerCase().replace(" ", "-") + "-jobs";
            page.navigate(url);

            // Updated selectors for current Naukri.com layout (2024-2025)
            try {
                page.waitForSelector(".srp-jobtuple-wrapper, .jobTuple-wrapper, article.jobTuple", 
                    new Page.WaitForSelectorOptions().setTimeout(8000));
            } catch (Exception waitEx) {
                System.err.println("Naukri page load timeout — selectors may have changed: " + waitEx.getMessage());
                browser.close();
                return jobs;
            }

            Locator cards = page.locator(".srp-jobtuple-wrapper, .jobTuple-wrapper, article.jobTuple");
            int count = Math.min(cards.count(), 10);

            for (int i = 0; i < count; i++) {
                    try { // BUG 18 FIX: Per-card try-catch
                    Locator card = cards.nth(i);
                    // Try multiple possible selectors for title
                    String title = "";
                    try { title = card.locator("a.title, .row1 a, .jobTitle").first().innerText().trim(); }
                    catch (Exception te) { title = "Unknown Title"; }

                    String company = "";
                    try { company = card.locator(".comp-name, .companyInfo a, .company-name").first().innerText().trim(); }
                    catch (Exception ce) { company = "Unknown Company"; }

                    String jobUrl = "";
                    try { jobUrl = card.locator("a.title, .row1 a").first().getAttribute("href"); }
                    catch (Exception ue) { jobUrl = "https://naukri.com"; }

                    // Try to extract salary and short description from the card when available
                    String salary = "";
                    try { salary = card.locator(".salary, .salarySpan, .salary-wrapper").first().innerText().trim(); } catch (Exception ignore) {}
                    String shortDesc = "";
                    try { shortDesc = card.locator(".job-description, .description, .more").first().innerText().trim(); } catch (Exception ignore) {}

                    if (!title.isEmpty()) {
                        // Use URL for dedup if available, otherwise use title+company
                        String dedupSource = (jobUrl != null && !jobUrl.isEmpty() && !jobUrl.equals("https://naukri.com")) 
                            ? jobUrl 
                            : (title + "|" + company);
                        // Build a better description from available info
                        StringBuilder desc = new StringBuilder();
                        if (!salary.isEmpty()) desc.append("Salary: ").append(salary).append("\n\n");
                        if (!shortDesc.isEmpty()) desc.append("Description: ").append(shortDesc).append("\n\n");
                        desc.append("Apply on Naukri.com for complete details.");
                        
                        jobs.add(Job.builder()
                            .title(title)
                            .company(company)
                            .url(jobUrl != null ? jobUrl : "https://naukri.com")
                            .salaryRange(salary)
                            .description(desc.toString())
                            .sourcePlatform("Naukri")
                            .jobType(Job.JobType.ONSITE)
                            .dedupHash(UUID.nameUUIDFromBytes(dedupSource.getBytes()).toString())
                            .build());
                    }
                } catch (Exception e) {
                    System.err.println("Skipping Naukri card " + i + ": " + e.getMessage());
                }
            }
            browser.close();
        } catch (Exception e) {
            System.err.println("Naukri scrape error: " + e.getMessage());
        }
        return jobs;
    }

    @Override
    public List<Job> scrapeIndeed(String role, String location) {
        // Indeed has strict anti-scraping — returning empty to avoid IP bans
        return new ArrayList<>();
    }

    @Override
    public List<Job> scrapeWWR(String role) {
        List<Job> jobs = new ArrayList<>();
        try (Playwright playwright = createPlaywright()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of("--no-sandbox")));
            Page page = browser.newPage();
            page.navigate("https://weworkremotely.com/remote-jobs/search?term=" + role.replace(" ", "+"));

            try {
                page.waitForSelector(".jobs li, .jobs article", 
                    new Page.WaitForSelectorOptions().setTimeout(8000));
            } catch (Exception waitEx) {
                System.err.println("WWR page load timeout: " + waitEx.getMessage());
                browser.close();
                return jobs;
            }

            Locator cards = page.locator(".jobs li:not(.view-all)");
            int count = Math.min(cards.count(), 10);
            for (int i = 0; i < count; i++) {
                try {
                    Locator card = cards.nth(i);
                    String title = card.locator(".title, span.title").first().innerText().trim();
                    String company = card.locator(".company, span.company").first().innerText().trim();
                    String href = "";
                    try { href = "https://weworkremotely.com" + card.locator("a").first().getAttribute("href"); }
                    catch (Exception e) { href = "https://weworkremotely.com"; }

                    if (!title.isBlank()) {
                        // Try to extract tags/skills from WWR
                        String tags = "";
                        try {
                            tags = card.locator(".tags, .tag").innerText().trim();
                        } catch (Exception ignore) {}
                        StringBuilder desc = new StringBuilder();
                        if (!tags.isEmpty()) desc.append("Skills/Tags: ").append(tags).append("\n\n");
                        desc.append("Full job description available at WeWorkRemotely.com");
                        
                        jobs.add(Job.builder()
                            .title(title).company(company).url(href).sourcePlatform("WWR")
                            .description(desc.toString())
                            .jobType(Job.JobType.REMOTE)
                            .dedupHash(UUID.nameUUIDFromBytes((title + "|" + company + "|WWR").getBytes()).toString())
                            .build());
                    }
                } catch (Exception e) {
                    System.err.println("Skipping WWR card " + i + ": " + e.getMessage());
                }
            }
            browser.close();
        } catch (Exception e) {
            System.err.println("WWR error: " + e.getMessage());
        }
        return jobs;
    }

    @Override
    public List<Job> scrapeRemoteOK(String role) {
        List<Job> jobs = new ArrayList<>();
        try (Playwright playwright = createPlaywright()) {
            Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of("--no-sandbox")));
            Page page = browser.newPage();
            page.navigate("https://remoteok.com/remote-" + role.replace(" ", "-") + "-jobs");

            try {
                page.waitForSelector("tr.job", 
                    new Page.WaitForSelectorOptions().setTimeout(8000));
            } catch (Exception waitEx) {
                System.err.println("RemoteOK page load timeout: " + waitEx.getMessage());
                browser.close();
                return jobs;
            }

            Locator cards = page.locator("tr.job");
            int count = Math.min(cards.count(), 10);
            for (int i = 0; i < count; i++) {
                try {
                    Locator card = cards.nth(i);
                    String title = card.locator("h2, td.company h2").first().innerText().trim();
                    String company = card.locator("h3, td.company h3").first().innerText().trim();

                    if (!title.isBlank()) {
                        // Try to extract tags from RemoteOK
                        String tags = "";
                        try {
                            tags = card.locator(".tags, .tag, td.tags").innerText().trim();
                        } catch (Exception ignore) {}
                        StringBuilder desc = new StringBuilder();
                        if (!tags.isEmpty()) desc.append("Skills/Tags: ").append(tags).append("\n\n");
                        desc.append("Full job description available at RemoteOK.com");
                        
                        jobs.add(Job.builder()
                            .title(title).company(company).sourcePlatform("RemoteOK")
                            .description(desc.toString())
                            .jobType(Job.JobType.REMOTE)
                            .dedupHash(UUID.nameUUIDFromBytes((title + "|" + company + "|RemoteOK").getBytes()).toString())
                            .build());
                    }
                } catch (Exception e) {
                    System.err.println("Skipping RemoteOK card " + i + ": " + e.getMessage());
                }
            }
            browser.close();
        } catch (Exception e) {
            System.err.println("RemoteOK error: " + e.getMessage());
        }
        return jobs;
    }
}
