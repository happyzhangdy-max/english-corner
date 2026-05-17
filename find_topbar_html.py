"""Find topbar HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Search for topbar or header section
for word in ['行小之', '英语角', 'topbar', 'top-bar']:
    i = c.find(word)
    if i >= 0:
        lno = c[:i].count('\n') + 1
        ctx = c[max(0,i-30):i+80]
        print(f'{word} at line ~{lno}: {repr(ctx)}')
