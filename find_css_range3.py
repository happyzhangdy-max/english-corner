"""Find all bottombar CSS and HTML blocks"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# The entire CSS for bottom nav is between:
# .bottombar {  ...  to the end of .bottombar__item--active
# Or better: find the next section comment after all bottombar rules
s = c.find('.bottombar {')
print(f'CSS starts at {s}')

# Look for comments that indicate next section
for kw in ['/* ===== Topbar', '/* ===== Brand', '/* ===== Hero', '/* ===== Header', '/* =====', '/* ==========']:
    e = c.find(kw, s+10)
    if e > 0:
        print(f'Next section "{kw[:30]}" at {e}')
        print(f'CSS range: {s} to {e} ({e-s} bytes)')
        print(f'First: {repr(c[s:s+50])}')
        print(f'Last: {repr(c[e-80:e])}')
        break
