from pathlib import Path
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
old = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\*?\\\\{(.*?)\\\\}", "$1");\n'
new = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\\\*?\\\\{(.*?)\\\\}", "$1");\n'
if old in text:
    path.write_text(text.replace(old, new), encoding='utf-8')
    print('REPLACED')
else:
    print('OLD_NOT_FOUND')
    # print the line for debugging
    for line in text.splitlines():
        if 'cleaned = cleaned.replaceAll' in line and 'a-zA-Z' in line:
            print(repr(line))
