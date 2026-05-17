"""Find home-card and topbar CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

for target in ['home-card {', 'topbar {', '.topbar {', '.home-card']:
    i = c.find(target)
    if i >= 0:
        lno = c[:i].count('\n') + 1
        print(f'Found "{target}" at line ~{lno}: {repr(c[i:i+80])}')
    else:
        print(f'Not found: "{target}"')
