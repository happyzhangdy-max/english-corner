"""Find vocab card rendering"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
lines = c.split('\n')
for i, line in enumerate(lines):
    if i > 45 and i < 60:
        print(f'{i+1}: {line[:300]}')
    # Also find where lv or vl appears in rendering
    if '>lv' in line or 'class=\"' in line and 'lv' in line:
        print(f'{i+1}: {line[:300]}')
