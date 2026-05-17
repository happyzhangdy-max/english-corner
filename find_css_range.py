"""Find bottombar CSS range"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
s = c.find('.bottombar {')
e = c.find('/* ===== Topbar', s)
print(f'CSS start={s}, end={e}')
print(f'First 100: {repr(c[s:s+100])}')
print(f'Last 50 before end: {repr(c[e-50:e])}')
