"""Check current nav HTML state"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Find the nav area
idx = c.find('class="bottom-nav"')
if idx < 0:
    idx = c.find('bottom-nav')
if idx >= 0:
    print(repr(c[idx:idx+300]))
# Check for nav-item--active leftover
cnt = c.count('nav-item--active')
cnt2 = c.count('nav-item.active')
print(f'nav-item--active: {cnt}')
print(f'nav-item.active: {cnt2}')
