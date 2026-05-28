# 🔷 HIREPATH: Complete Project Report

## 1. Brand Identity
- **Name**: HirePath
- **Tagline**: "Your AI-powered path to the right job"
- **Logo Meaning**:
  The logo shows an upward arrow (▲) made from two lines meeting at a peak, with a green horizontal line cutting through the middle — representing the "path" you take, with the green accent showing success and growth. The dot at the top is the destination — your dream job. The blue represents trust and technology; the green represents success and forward movement.
- **Why HirePath?**: "Hire" = getting hired. "Path" = a clear, guided journey. It tells students: "This tool will create a path to your hiring."

---

## 2. Visual Layouts (Page Mockups)

### Page 1: Search Jobs (The Hub)
![Search Jobs Mockup](https://via.placeholder.com/800x400.png?text=HirePath+Search+Jobs+Dashboard)
*Description*: Features a central search bar, role dropdown, and "Scanned Jobs" feed with Match Scores (e.g., 92%). Action buttons: Upgrade Resume, Preview (Eye), and Apply.

### Page 2: Applied & Status Tracker
![Status Tracker Mockup](https://via.placeholder.com/800x400.png?text=HirePath+Application+Funnel)
*Description*: A Kanban board (Applied -> Screening -> Interview -> Offer). Real-time status updates and stats cards for total applications.

### Page 3: Resume Hub
![Resume Hub Mockup](https://via.placeholder.com/800x400.png?text=HirePath+Resume+Versions)
*Description*: Library of all tailored resumes. Shows ATS scores and "Skill Gap Analysis" to help students identify what to learn next.

### Page 4: AI Interview Prep
![Interview Prep Mockup](https://via.placeholder.com/800x400.png?text=HirePath+Interview+Simulator)
*Description*: Timed practice mode with AI-generated questions specific to the job description. Topic tags like DSA, System Design, and Behavioral.

### Page 5: Pricing & Upgrade
![Pricing Mockup](https://via.placeholder.com/800x400.png?text=HirePath+Pricing+Tiers)
*Description*: Three tiers: Free (₹0), Pro (₹199), and Elite (₹499). Clear comparison of features like "Auto-Apply" and "LaTeX Resumes."

---

## 3. Tech Stack Deep Dive
- **Frontend**: Next.js 14, Tailwind CSS, TypeScript, Framer Motion.
- **Backend**: Spring Boot 3.2, MySQL 8.0, Redis (for caching & deduplication).
- **AI Core**: Claude 3.5 Sonnet (LLM), Puppeteer (PDF Gen), PDFBox (Text Extraction).
- **Automation**: Playwright (Browser Automation), Bull Queue (Async Task Mgmt).
- **Payments**: Razorpay (Primary) & Stripe (International).

---

## 4. Master ChatGPT Prompt for Development
*(Copy and paste the prompt below into ChatGPT to continue building specific modules)*

```text
Act as a Senior Full-Stack Engineer. I am building "HirePath", an AI job agent for students. 
The stack is Next.js (Frontend), Spring Boot (Backend), MySQL, and Claude API (AI).

Phase 1 Goal: Build the [Insert Module Name: e.g., Resume Tailoring Service].
Context:
- Brand: HirePath (Blue/Green theme).
- AI: Using Claude 3.5 Sonnet for resume rewriting.
- Output: PDF generation via Puppeteer.

Requirements:
1. Provide the complete code for [Module Name].
2. Ensure it follows the database schema: Users, Jobs, Applications, ResumeVersions.
3. Include clear comments and error handling for API failures.
4. Make the UI responsive using Tailwind CSS.

[Add specific requirements for the current task here]
```

---

## 5. Development Roadmap
1. **Week 1**: Core Auth & Resume Parsing.
2. **Week 2**: Job Scraping (Wellfound, RemoteOK) & Match Scoring.
3. **Week 3**: AI Resume Tailoring & PDF Generation.
4. **Week 4**: Payment Integration & Dashboard Launch.
