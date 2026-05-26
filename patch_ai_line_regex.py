from pathlib import Path
import re
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
pattern = re.compile(r'^\s*cleaned = cleaned\.replaceAll\(".*\[a-zA-Z\]\+.*')
replacement = '        cleaned = cleaned.replaceAll("\\\\[a-zA-Z]+\\*?\\\\{(.*?)\\\\}", "$1");'
found = False
for idx, line in enumerate(lines):
    if pattern.match(line):
        print('PATCHING LINE:', repr(line))
        lines[idx] = replacement
        found = True
        break
if found:
    path.write_text("\n".join(lines) + "\n", encoding='utf-8')
    print('REPLACED')
else:
    print('NOT_FOUND')
    for line in lines:
        if 'cleaned = cleaned.replaceAll' in line and '[a-zA-Z]+' in line:
            print(repr(line))
