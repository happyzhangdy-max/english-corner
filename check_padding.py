"""Check page padding-bottom"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Find padding-bottom rules
import re
for m in re.finditer(r'padding-bottom[^;]+;', c):
    l = c[:m.start()].count('\n') + 1
    print(f'Line ~{l}: {m.group().strip()}')
# Also find .page-content or .page padding
for m in re.finditer(r'\.page[^}]*\{[^}]*\}', c):
    l = c[:m.start()].count('\n') + 1
    print(f'Line ~{l}: {m.group()[:200]}')
