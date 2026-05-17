"""Find all localStorage key patterns"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
# Find all localStorage getItem/setItem calls
for m in re.finditer(r"localStorage\.(getItem|setItem)\('([^']+)'\)", c):
    line = c[:m.start()].count('\n') + 1
    print(f'Line {line}: {m.group()}')
