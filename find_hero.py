"""Find hero HTML section"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Search for hero-related elements
# The hero might use h1 with "英语角"
idx = c.find('<h1')
while idx >= 0:
    lno = c[:idx].count('\n') + 1
    e = c.find('</h1>', idx) + 5
    print(f'Line ~{lno}: {c[idx:e][:200]}')
    idx = c.find('<h1', idx+5)
