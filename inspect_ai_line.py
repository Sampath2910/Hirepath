from pathlib import Path
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
for line in text.splitlines():
    if 'cleaned = cleaned.replaceAll' in line and 'a-zA-Z' in line:
        print(line)
        print(line.encode('unicode_escape'))
        print('---')
