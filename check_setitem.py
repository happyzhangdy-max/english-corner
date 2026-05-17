"""Find setItem calls"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
import re
for m in re.finditer(r"localStorage\.setItem\('([^']+)'", c):
    line = c[:m.start()].count('\n') + 1
    print(f'Line {line}: {m.group()}')
