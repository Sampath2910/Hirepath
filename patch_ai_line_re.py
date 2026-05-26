from pathlib import Path
import re
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
new_line = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\*?\\\\{(.*?)\\\\}", "$1");'
pattern = re.compile(r'^\s*cleaned = cleaned\.replaceAll\("\\\\\\\\\[a-zA-Z\]\+\\\\\*\?\\\\\\\\\{\(\.\*\?\)\\\\\\\\\}", \"\$1\"\);$', re.MULTILINE)
text, count = pattern.subn(new_line, text)
if count == 0:
    print('NO_MATCH', count)
    for line in text.splitlines():
        if 'cleaned = cleaned.replaceAll' in line and 'a-zA-Z' in line:
            print('FOUND_LINE:', repr(line))
else:
    path.write_text(text, encoding='utf-8')
    print('REPLACED', count)
