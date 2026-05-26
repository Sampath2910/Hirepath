from pathlib import Path
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
old = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\\\*?\\\\\\\{(.*?)\\\\\\\}", "$1");\n'
new = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\*?\\\\{(.*?)\\\\}", "$1");\n'
if old not in text:
    print('OLD_NOT_FOUND')
    start = text.find('cleaned = cleaned.replaceAll("\\$')
    print(text[start:start+200])
else:
    path.write_text(text.replace(old, new), encoding='utf-8')
    print('REPLACED')
