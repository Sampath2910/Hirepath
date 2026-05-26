from pathlib import Path
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
old_line = r'        cleaned = cleaned.replaceAll("\\[a-zA-Z]+\\*?\\\{(.*?)\\\}", "$1");'
new_line = r'        cleaned = cleaned.replaceAll("\\[a-zA-Z]+\*?\\\{(.*?)\\\}", "$1");'
if old_line in text:
    text = text.replace(old_line, new_line)
    path.write_text(text, encoding='utf-8')
    print('REPLACED')
else:
    print('OLD_MISSING')
    for line in text.splitlines():
        if 'cleaned = cleaned.replaceAll' in line and 'a-zA-Z' in line:
            print(repr(line))
