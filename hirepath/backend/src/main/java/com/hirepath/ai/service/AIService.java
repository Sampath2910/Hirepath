package com.hirepath.ai.service;

import com.hirepath.ai.model.Job;
import java.util.List;
import java.util.Map;

public interface AIService {
    /**
     * Parses resume text from a PDF.
     */
    String parseResume(byte[] pdfBytes);

    /**
     * Rewrites a resume based on a job description.
     */
    String tailorResume(String masterResume, Job job);

    /**
     * Generates a cover letter for a specific job.
     */
    String generateCoverLetter(String resumeText, Job job);

    /**
     * Scores a job match for a user.
     */
    int scoreJobMatch(String resumeText, Job job);
    
    /**
     * Generates interview questions based on job description.
     */
    List<Map<String, String>> generateInterviewQuestions(Job job, String resumeText);
    
    /**
     * Chatbot streaming response generator.
     */
    String chatbotResponse(String userMessage, String context);
    
    /**
     * Skill gap analysis comparing resume to target jobs.
     */
    List<Map<String, Object>> skillGapAnalysis(String resumeText, List<Job> targetJobs);

    /**
     * Generates a professional PDF version of the tailored resume.
     * @param tailoredText The tailored resume content
     * @param jobTitle The job title to use in the PDF header
     */
    byte[] generateResumePdf(String tailoredText, String jobTitle);
}
