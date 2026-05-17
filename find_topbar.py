"""Find topbar CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Search for various topbar patterns
for target in ['topbar', 'top-bar', 'topBar', 'header']:
    i = c.find(target)
    if i >= 0:
        lno = c[:i].count('\n') + 1
        ctx = c[max(0,i-20):i+60]
        print(f'{target} at line ~{lno}: {repr(ctx)}')
