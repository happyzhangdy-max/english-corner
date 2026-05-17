"""Search bar CSS update"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find search-related CSS
s = c.find('.search-wrap')
if s >= 0:
    e = c.find('/* =====', s)
    print(f'search-wrap CSS: {s} to {e}')
    print(repr(c[s:e]))
else:
    # Find individual search classes
    for cls in ['.search-input', '.search-icon', '.search-clear']:
        i = c.find(cls)
        if i >= 0:
            lno = c[:i].count('\n') + 1
            e = c.find('}', i)
            print(f'Line ~{lno}: {c[i:e+1][:200]}')
