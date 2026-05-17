"""Find Japanese text in game files"""
import re
import os
os.chdir(r'C:\workcraft\english-corner\game')
for f in ['boxing.js','tower-climb.js']:
    c = open(f,'r',encoding='utf-8').read()
    lines = c.split('\n')
    ja_lines = []
    for i, line in enumerate(lines):
        ja = re.findall(r'[\u3040-\u309F\u30A0-\u30FF]+', line)
        if ja:
            ja_lines.append((i+1, line.strip()[:100]))
    print(f'\n=== {f} === Japanese text ({len(ja_lines)} lines):')
    for ln, txt in ja_lines:
        print(f'  L{ln}: {txt}')
