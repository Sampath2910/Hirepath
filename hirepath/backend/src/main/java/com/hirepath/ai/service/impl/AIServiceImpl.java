package com.hirepath.ai.service.impl;

import com.hirepath.ai.model.Job;
import com.hirepath.ai.service.AIService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;
import java.util.Map;
import java.util.List;

@Service
public class AIServiceImpl implements AIService {

    private final WebClient webClient;

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public AIServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    private String callAI(String prompt) {
        // Try Claude First
        String response = callClaude(prompt);
        
        if (response.startsWith("Error") || response.startsWith("CLAUDE_API_KEY_NOT_SET")) {
            System.out.println("Claude failed or not configured, falling back to Gemini...");
            return callGemini(prompt);
        }
        
        return response;
    }

    private String callClaude(String prompt) {
        if ("YOUR_CLAUDE_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty()) {
            return "CLAUDE_API_KEY_NOT_SET: Please configure claude.api.key in application.properties";
        }
        Map<String, Object> body = Map.of(
            "model", "claude-3-5-sonnet-20241022",
            "max_tokens", 4096,
            "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        try {
            Map<String, Object> response = webClient.post()
                .uri(apiUrl)
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            if (response != null && response.get("content") != null) {
                List<Map<String, String>> content = (List<Map<String, String>>) response.get("content");
                return content.get(0).get("text");
            }
        } catch (Exception e) {
            return "Error calling Claude API: " + e.getMessage();
        }
        return "Failed to get response from Claude API";
    }

    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equals("${GEMINI_API_KEY:}")) {
            return "GEMINI_API_KEY_NOT_SET: Please configure gemini.api.key in application.properties";
        }

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        // Use the configured URL directly - no fallbacks
        String apiUrl = geminiApiUrl + "?key=" + geminiApiKey;

        try {
            Map<String, Object> response = webClient.post()
                .uri(apiUrl)
                .header("content-type", "application/json")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .map(errorBody -> new RuntimeException("HTTP " + clientResponse.statusCode().value() + ": " + errorBody)))
                .bodyToMono(Map.class)
                .block();

            if (response == null) {
                return "Error: Empty response from Gemini API";
            }

            // Check for error in response
            if (response.get("error") != null) {
                return "Error from Gemini API: " + response.get("error");
            }

            // Parse response: candidates -> [ { content: { parts: [ { text } ] } } ]
            if (response.get("candidates") != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Object contentObj = candidates.get(0).get("content");
                    if (contentObj instanceof Map) {
                        Map<String, Object> content = (Map<String, Object>) contentObj;
                        Object partsObj = content.get("parts");
                        if (partsObj instanceof List) {
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) partsObj;
                            if (!parts.isEmpty() && parts.get(0).get("text") != null) {
                                return String.valueOf(parts.get(0).get("text"));
                            }
                        }
                    }
                }
            }

            return "Error: Unexpected response format from Gemini API";
        } catch (Exception e) {
            return "Error calling Gemini API: " + e.getMessage();
        }
    }

    @Override
    public String parseResume(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String rawText = stripper.getText(document);
            
            // AI Cleanup: Resumes can be messy when parsed. Let's clean them up.
            String prompt = "Act as a document parser. Clean and format the following raw text extracted from a resume. " +
                    "Preserve all names, emails, skills, and dates, but fix formatting and remove noise. " +
                    "Output only the clean, readable text.\n\n" + rawText;
            
            return callAI(prompt);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse PDF resume", e);
        }
    }

    @Override
    public String tailorResume(String masterResume, Job job) {
        String prompt = String.format(
            "Act as a professional resume writer. Create a tailored resume for the following job based on the master resume.\n\n" +
            "IMPORTANT RULES:\n" +
            "1. DO NOT use LaTeX, markdown, HTML, or any code fences.\n" +
            "2. DO NOT use star ratings (★, ☆) or any rating symbols.\n" +
            "3. DO NOT include placeholders like [Your Name], [Your Email], [Your Phone].\n" +
            "4. Extract the candidate's actual name, email, phone, and location FROM the master resume.\n" +
            "5. NEVER fabricate employer names, education entries, dates, or locations. If detail is missing, omit it or use a concise line such as 'Details available upon request'.\n" +
            "6. Use plain text format with clear headings, bullet points, and strong professional language.\n" +
            "7. Structure: Header (Name + Contact), Summary, Skills, Experience, Education.\n" +
            "8. Highlight skills that match the job requirements.\n" +
            "9. Use action verbs and quantify achievements.\n\n" +
            "Master Resume (source material):\n%s\n\n" +
            "Target Job:\n" +
            "- Title: %s\n" +
            "- Company: %s\n" +
            "- Description: %s\n\n" +
            "Output ONLY the formatted resume text. No explanations, no markdown code blocks, no LaTeX.\n",
            masterResume, job.getTitle(), job.getCompany(), 
            job.getDescription() != null ? job.getDescription() : "Not provided"
        );
        String tailored = callAI(prompt);
        return cleanResumeOutput(tailored);
    }

    @Override
    public String generateCoverLetter(String resumeText, Job job) {
        String prompt;
        if (job != null) {
            prompt = String.format(
                "Write a professional cover letter for the following job based on this resume.\n\n" +
                "IMPORTANT RULES:\n" +
                "1. Extract the candidate's actual name FROM the resume - DO NOT use placeholders.\n" +
                "2. If no name found in resume, use 'Candidate' as the name.\n" +
                "3. DO NOT use [Your Name], [Your Address], [Date] placeholders.\n" +
                "4. Start directly with the date and recipient info.\n" +
                "5. Keep it concise: 3-4 paragraphs max.\n" +
                "6. Match candidate's skills to job requirements.\n" +
                "7. End with professional sign-off.\n\n" +
                "Candidate Resume:\n%s\n\n" +
                "Target Job:\n" +
                "- Title: %s\n" +
                "- Company: %s\n" +
                "- Description: %s\n\n" +
                "Output ONLY the cover letter text. No markdown, no code blocks.\n",
                resumeText, job.getTitle(), job.getCompany(), 
                job.getDescription() != null ? job.getDescription() : "Not provided"
            );
        } else {
            // General chat or other generation
            prompt = resumeText;
        }
        return callAI(prompt);
    }

    private String cleanResumeOutput(String text) {
        if (text == null) {
            return "";
        }
        String cleaned = text.trim();

        // Remove markdown fences
        cleaned = cleaned.replaceAll("(?s)```.*?```", "");

        // Convert common LaTeX commands to plain text
        cleaned = cleaned.replaceAll("\\\\documentclass\\{.*?\\}", "");
        cleaned = cleaned.replaceAll("\\\\usepackage\\{.*?\\}", "");
        cleaned = cleaned.replaceAll("\\\\begin\\{document\\}", "");
        cleaned = cleaned.replaceAll("\\\\end\\{document\\}", "");
        cleaned = cleaned.replaceAll("\\\\section\\{(.*?)\\}", "$1\n----------------------------------------");
        cleaned = cleaned.replaceAll("\\\\subsection\\{(.*?)\\}", "$1\n");
        cleaned = cleaned.replaceAll("\\\\textbf\\{(.*?)\\}", "$1");
        cleaned = cleaned.replaceAll("\\\\textit\\{(.*?)\\}", "$1");
        cleaned = cleaned.replaceAll("\\\\emph\\{(.*?)\\}", "$1");
        cleaned = cleaned.replaceAll("\\\\item", "- ");
        cleaned = cleaned.replaceAll("\\\\newline", "\n");
        cleaned = cleaned.replaceAll("\\\\\\\\", "\n");
        cleaned = cleaned.replaceAll("\\\\", "\n");

        // Remove markdown-style headings and blockquote markers
        cleaned = cleaned.replaceAll("(?m)^#{1,6}\\s*", "");
        cleaned = cleaned.replaceAll("(?m)^>\\s*", "");

        // Remove common placeholder blocks that AI may add when details are missing
        cleaned = cleaned.replaceAll("(?m)^\\[(Previous Company Name|City, State|Dates of Employment|Degree Name|University Name|Year of Graduation|Your Name|Your Email|Your Phone|Your Address|Your Location)\\]\\s*$", "");
        cleaned = cleaned.replaceAll("(?m)^\\[.*?\\]\\s*$", "");

        // Convert inline math or LaTeX formatting
        cleaned = cleaned.replaceAll("\\$([^$]*)\\$", "$1");
        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\*?\\{(.*?)\\}", "$1");

        // Convert starred list items to dashes for consistency
        cleaned = cleaned.replaceAll("(?m)^\\*\\s+", "- ");

        // Strip any remaining LaTeX commands
        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+", "");

        // Normalize whitespace
        cleaned = cleaned.replaceAll("\r\n", "\n");
        cleaned = cleaned.replaceAll("\n{3,}", "\n\n");
        cleaned = cleaned.strip();

        return cleaned;
    }

    @Override
    public int scoreJobMatch(String resumeText, Job job) {
        String prompt = String.format(
            "Analyze the match between this resume and job description. Provide an overall score out of 100.\n\n" +
            "Resume:\n%s\n\n" +
            "Job Title: %s\n" +
            "Job Description: %s\n\n" +
            "Output ONLY the numeric score as a number between 0 and 100 (e.g., 85). Do not include any text, just the number.",
            resumeText, job.getTitle(), job.getDescription() != null ? job.getDescription() : ""
        );
        try {
            String result = callAI(prompt).trim();
            
            // Check if result is an error message
            if (result.startsWith("Error") || result.startsWith("GEMINI") || result.startsWith("CLAUDE") || result.startsWith("Failed")) {
                System.err.println("AI API error in scoreJobMatch: " + result);
                return 70; // Fallback score when API fails
            }
            
            // Extract only the first number from the result
            String numericPart = result.replaceAll("[^0-9]", "");
            if (numericPart.isEmpty()) {
                return 70; // Fallback if no number found
            }
            
            int score = Integer.parseInt(numericPart);
            // Ensure score is within valid range (0-100)
            if (score < 0) score = 0;
            if (score > 100) score = 100;
            return score;
        } catch (Exception e) {
            System.err.println("Exception in scoreJobMatch: " + e.getMessage());
            return 70; // Fallback score
        }
    }

    @Override
    public List<Map<String, String>> generateInterviewQuestions(Job job, String resumeText) {
        String prompt = String.format(
            "Generate 3 technical interview questions for this job and candidate.\n\n" +
            "Job Title: %s\n" +
            "Company: %s\n" +
            "Job Description: %s\n\n" +
            "Candidate Resume:\n%s\n\n" +
            "Output the response as a JSON array of objects with fields: 'topic', 'difficulty' (Easy/Medium/Hard), 'question', and 'answer'. Output ONLY the JSON array.",
            job.getTitle(), job.getCompany(), job.getDescription(), resumeText
        );
        
        try {
            String result = callAI(prompt);
            // Clean JSON if needed (sometimes models wrap in markdown)
            if (result.contains("```json")) {
                result = result.substring(result.indexOf("```json") + 7, result.lastIndexOf("```"));
            } else if (result.contains("```")) {
                result = result.substring(result.indexOf("```") + 3, result.lastIndexOf("```"));
            }
            
            // Simple manual parsing or use Jackson
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(result, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, String>>>() {});
        } catch (Exception e) {
            System.err.println("Error generating interview questions: " + e.getMessage());
            return List.of(
                Map.of("topic", "General", "difficulty", "Medium", "question", "Tell me about your experience with " + job.getTitle(), "answer", "Describe your relevant projects and skills.")
            );
        }
    }

    @Override
    public String chatbotResponse(String userMessage, String context) {
        String prompt = "You are HirePath AI Copilot. The user asks: " + userMessage + "\nContext: " + context;
        return callAI(prompt); // Use callAI so Gemini fallback applies if Claude is unavailable
    }

    @Override
    public List<Map<String, Object>> skillGapAnalysis(String resumeText, List<Job> targetJobs) {
        if (resumeText == null || resumeText.isBlank() || targetJobs == null || targetJobs.isEmpty()) {
            return List.of(
                Map.of("skill", "Docker", "priority", "High", "reason", "Required by most DevOps roles", "resource", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
                Map.of("skill", "Kubernetes", "priority", "High", "reason", "Standard container orchestration", "resource", "https://www.youtube.com/watch?v=X48VuDVv0do"),
                Map.of("skill", "System Design", "priority", "High", "reason", "Critical for senior interviews", "resource", "https://www.youtube.com/watch?v=i53Gi_K3o7I"),
                Map.of("skill", "AWS", "priority", "Medium", "reason", "Cloud skills are in high demand", "resource", "https://www.youtube.com/watch?v=SOTamWNgDKc"),
                Map.of("skill", "GraphQL", "priority", "Medium", "reason", "Modern API standard", "resource", "https://www.youtube.com/watch?v=ed8SzALpx1Q")
            );
        }

        // Build a summary of required skills from target jobs
        StringBuilder jobsSummary = new StringBuilder();
        int limit = Math.min(targetJobs.size(), 5); // Limit to 5 jobs for prompt size
        for (int i = 0; i < limit; i++) {
            Job j = targetJobs.get(i);
            jobsSummary.append(String.format("- %s at %s: %s\n",
                j.getTitle(),
                j.getCompany(),
                j.getDescription() != null ? j.getDescription().substring(0, Math.min(200, j.getDescription().length())) : "No description"));
        }

        String prompt = String.format(
            "Analyze this resume against the following job requirements. Identify 5 missing or weak skills.\n\n" +
            "Resume:\n%s\n\n" +
            "Target Jobs:\n%s\n\n" +
            "Output a JSON array of 5 objects with these fields: 'skill', 'priority' (High/Medium/Low), 'reason', 'resource' (YouTube tutorial URL)." +
            "Output ONLY the JSON array, no markdown.",
            resumeText.substring(0, Math.min(resumeText.length(), 1500)),
            jobsSummary
        );

        try {
            String result = callAI(prompt);
            if (result.contains("```json")) {
                result = result.substring(result.indexOf("```json") + 7, result.lastIndexOf("```")).trim();
            } else if (result.contains("```")) {
                result = result.substring(result.indexOf("```") + 3, result.lastIndexOf("```")).trim();
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(result, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            System.err.println("Error in skillGapAnalysis: " + e.getMessage());
            // Return default skill gaps as fallback
            return List.of(
                Map.of("skill", "Docker", "priority", "High", "reason", "Required by target jobs", "resource", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
                Map.of("skill", "System Design", "priority", "High", "reason", "Critical for senior roles", "resource", "https://www.youtube.com/watch?v=i53Gi_K3o7I"),
                Map.of("skill", "AWS", "priority", "Medium", "reason", "Cloud is in high demand", "resource", "https://www.youtube.com/watch?v=SOTamWNgDKc")
            );
        }
    }

    @Override
    public byte[] generateResumePdf(String tailoredText, String jobTitle) {
        try (com.microsoft.playwright.Playwright playwright = com.microsoft.playwright.Playwright.create()) {
            com.microsoft.playwright.Browser browser = playwright.chromium().launch(new com.microsoft.playwright.BrowserType.LaunchOptions().setHeadless(true));
            com.microsoft.playwright.Page page = browser.newPage();
            
            // Professional Overleaf-style LaTeX-inspired HTML Template
            String displayTitle = jobTitle != null ? jobTitle + " Resume" : "Professional Resume";
            String htmlContent = String.format(
                "<!DOCTYPE html><html><head><style>" +
                "@import url('https://fonts.googleapis.com/css2?family=Latin+Modern+Roman:wght@400;700&family=Computer+Modern:wght@400;700&display=swap');" +
                "body { font-family: 'Computer Modern', 'Latin Modern Roman', 'Georgia', 'Times New Roman', serif; line-height: 1.5; color: #1a1a1a; padding: 30px 40px; max-width: 800px; margin: 0 auto; }" +
                ".header { text-align: center; margin-bottom: 25px; }" +
                ".header h1 { font-size: 24px; font-weight: 700; color: #000; margin: 0 0 8px 0; letter-spacing: 1px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; }" +
                ".header .subtitle { font-size: 11px; color: #555; font-style: italic; }" +
                ".content { white-space: pre-wrap; font-size: 10.5pt; }" +
                ".section { margin-bottom: 16px; }" +
                ".section-title { font-weight: 700; font-size: 11pt; color: #000; border-bottom: 1px solid #333; padding-bottom: 3px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }" +
                ".contact-line { text-align: center; font-size: 10pt; color: #333; margin-bottom: 15px; }" +
                "p { margin: 6px 0; }" +
                "ul { margin: 6px 0; padding-left: 20px; }" +
                "li { margin: 3px 0; }" +
                "strong { font-weight: 700; color: #000; }" +
                "em { font-style: italic; }" +
                "</style></head><body>" +
                "<div class='header'><h1>%s</h1><div class='subtitle'>Generated by HirePath AI</div></div>" +
                "<div class='content'>%s</div>" +
                "</body></html>",
                displayTitle,
                tailoredText.replace("\n", "<br>").replace("**", "<strong>").replace("__", "<em>")
            );
            
            page.setContent(htmlContent);
            byte[] pdf = page.pdf(new com.microsoft.playwright.Page.PdfOptions().setFormat("A4").setPrintBackground(true));
            browser.close();
            return pdf;
        } catch (Exception e) {
            System.err.println("Error generating PDF: " + e.getMessage());
            return new byte[0];
        }
    }
}
