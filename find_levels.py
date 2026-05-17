"""Find level label rendering in inline.js"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
lines = c.split('\n')
for i, line in enumerate(lines):
    if i > 5 and i < 90:  # renderV and related functions
        if 'lv' in line.lower() or 'level' in line.lower():
            print(f'{i+1}: {line[:200]}')
