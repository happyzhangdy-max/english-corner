"""Find LEVELS variable definition"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
# Search for var LEVELS or let LEVELS or const LEVELS
import re
for m in re.finditer(r'LEVELS', c):
    pos = m.start()
    line_num = c[:pos].count('\n') + 1
    context = c[max(0,pos-50):pos+100]
    print(f'Line ~{line_num}: ...{context.strip()}...')
    print()
