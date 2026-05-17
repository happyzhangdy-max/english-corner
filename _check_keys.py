import re, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    content = f.read()
found = []
for i, line in enumerate(content.split('\n'), 1):
    matches = re.findall(r"localStorage\.(?:getItem|setItem|removeItem)\(\s*'([^']+)'", line)
    for m in matches:
        if m == 'en':
            continue
        if not m.startswith('en_'):
            found.append((i, m, line.strip()[:80]))
if found:
    for ln, key, text in found:
        print(f'BARE L{ln:>4}: KEY="{key}"  ->  {text}')
    sys.exit(1)
else:
    print(f'ALL_OK: No bare localStorage keys found in {sys.argv[1]}')
