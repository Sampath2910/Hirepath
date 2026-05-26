from pathlib import Path
path = Path('hirepath/backend/src/main/java/com/hirepath/ai/service/impl/AIServiceImpl.java')
for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), start=1):
    if i >= 235 and i <= 242:
        print(i, repr(line))
