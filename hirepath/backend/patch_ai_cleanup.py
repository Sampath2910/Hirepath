from pathlib import Path

path = Path(r'C:\Users\akkap\OneDrive\Desktop\myfirstaiapp\hirepath\backend\src\main\java\com\hirepath\ai\service\impl\AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
old = '''    private String cleanResumeOutput(String text) {
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
        cleaned = cleaned.replaceAll("\\[a-zA-Z]+\\*?\\{(.*?)\\}", "$1");

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
'''
new = '''    private String cleanResumeOutput(String text) {
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
        cleaned = cleaned.replaceAll("\\[(Previous Company Name|City, State|Dates of Employment|Degree Name|Major|University Name|Year of Graduation|Your Name|Your Email|Your Phone|Your Address|Your Location)\\]", "");
        cleaned = cleaned.replaceAll("(?m)^\\[.*?\\]\\s*$", "");
        cleaned = cleaned.replaceAll("(?m)^\\s*[|\\-]\\s*$", "");

        // Convert inline math or LaTeX formatting
        cleaned = cleaned.replaceAll("\\$([^$]*)\\$", "$1");
        cleaned = cleaned.replaceAll("\\[a-zA-Z]+\\*?\\{(.*?)\\}", "$1");

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
'''
if old not in text:
    raise SystemExit('Old block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('patched')
