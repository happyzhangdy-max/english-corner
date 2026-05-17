"""Find vocab card level rendering"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
lines = c.split('\n')
for i, line in enumerate(lines):
    # Search for where level is rendered in the card
    if 'lv' in line.lower() and ('class=' in line or 'innerHTML' in line or '+=' in line) and i > 1300:
        print(f'{i+1}: {line[:250]}')
