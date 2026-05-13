import re
with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

for jp in ['ている', 'うちに', 'なければならない', 'なし', 'おいしい', 'しい']:
    idx = c.find(jp)
    if idx >= 0:
        start = max(0, idx-150)
        end = min(len(c), idx+150)
        print(f'=== Found: {jp} at pos {idx} ===')
        print(c[start:end])
        print()
