package com.hirepath.ai.controller;

import com.hirepath.ai.service.AIService;
import com.hirepath.ai.model.ResumeVersion;
import com.hirepath.ai.model.User;
import com.hirepath.ai.model.Job;
import com.hirepath.ai.repository.ResumeVersionRepository;
import com.hirepath.ai.repository.UserRepository;
import com.hirepath.ai.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private AIService aiService;
    
    @Autowired
    private ResumeVersionRepository resumeVersionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @PostMapping("/parse")
    public String parseResume(@RequestParam("file") MultipartFile file) throws IOException {
        return aiService.parseResume(file.getBytes());
    }
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadMasterResume(@RequestParam("file") MultipartFile file, @RequestParam Long userId) throws IOException {
        String parsedText = aiService.parseResume(file.getBytes());
        userRepository.findById(userId).ifPresent(user -> {
            user.setResumeMasterText(parsedText);
            user.setResumeMasterUrl("local_storage_" + file.getOriginalFilename());
            userRepository.save(user);
        });
        return ResponseEntity.ok(parsedText);
    }
    
    @PostMapping("/tailor/{jobId}")
    public ResponseEntity<String> tailorResume(@PathVariable Long jobId, @RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (user.getResumeMasterText() == null) {
            return ResponseEntity.badRequest().body("No master resume found. Please upload one first.");
        }

        String tailoredText = aiService.tailorResume(user.getResumeMasterText(), job);
        int score = aiService.scoreJobMatch(tailoredText, job);

        ResumeVersion version = resumeVersionRepository.findByUserIdAndJobId(userId, jobId)
                .orElse(new ResumeVersion());
        
        version.setUser(user);
        version.setJob(job);
        version.setTailoredText(tailoredText);
        version.setPdfUrl("tailored_local_" + System.currentTimeMillis() + ".pdf");
        version.setAtsScore(score);
        version.setCreatedAt(LocalDateTime.now());
        
        resumeVersionRepository.save(version);
        
        return ResponseEntity.ok(tailoredText);
    }

    @GetMapping("/versions")
    public ResponseEntity<List<ResumeVersion>> getUserVersions(@RequestParam Long userId) {
        return ResponseEntity.ok(resumeVersionRepository.findByUserId(userId));
    }

    @GetMapping("/version")
    public ResponseEntity<ResumeVersion> getTailoredVersion(@RequestParam Long userId, @RequestParam Long jobId) {
        return resumeVersionRepository.findByUserIdAndJobId(userId, jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cover-letter/{jobId}")
    public ResponseEntity<String> generateCoverLetter(@PathVariable Long jobId, @RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (user.getResumeMasterText() == null) {
            return ResponseEntity.badRequest().body("No master resume found. Please upload one first.");
        }

        String coverLetter = aiService.generateCoverLetter(user.getResumeMasterText(), job);
        return ResponseEntity.ok(coverLetter);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        return resumeVersionRepository.findById(id)
                .map(version -> {
                    String jobTitle = version.getJob() != null ? version.getJob().getTitle() : "Professional";
                    byte[] pdf = aiService.generateResumePdf(version.getTailoredText(), jobTitle);
                    String filename = jobTitle.replaceAll("[^a-zA-Z0-9]", "_") + "_Resume.pdf";
                    return ResponseEntity.ok()
                            .header("Content-Type", "application/pdf")
                            .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                            .body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
