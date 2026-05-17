"""Find vocab card rendering and level labels"""
with open('inline.js', 'r', encoding='utf-8') as f:
    c = f.read()
lines = c.split('\n')
# Find the part of renderV that generates card HTML
# It's around line 47 but heavily minified
# Let me search for 'vocab-card' or 'vc-'
for i, line in enumerate(lines):
    if i > 40 and i < 55:
        print(f'{i+1}: {line[:300]}')
