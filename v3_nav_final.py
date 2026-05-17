"""Full nav HTML replacement"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find the <div class="bottom-nav">...</div> block
s = c.find('class="bottom-nav">')
if s < 0:
    print('ERROR: bottom-nav not found')
    exit()
    
# Go back to find the opening <div or <nav
open_tag = c.rfind('<', s-20, s)
print(f'Open tag at: {open_tag}, content: {repr(c[open_tag:open_tag+50])}')

# Find closing </div> or </nav>
remaining = c[s:]
d = 0
end_pos = -1
found_tag = False
for i, ch in enumerate(remaining):
    if ch == '<':
        if remaining[i:i+5] == '<div ' or remaining[i:i+5] == '<nav ':
            d += 1
        elif remaining[i:i+6] == '</div>' or remaining[i:i+7] == '</nav>':
            d -= 1
            if d == 0:
                end_pos = s + i + 7  # Past </div> or </nav>
                found_tag = True
                print(f'End at: {end_pos}')
                break
        elif remaining[i:i+6] == '</div>':
            d -= 1
            if d == 0:
                end_pos = s + i + 6  # Past </div>
                found_tag = True
                print(f'End at: {end_pos}')
                break

if not found_tag:
    print('ERROR: could not find end')
    exit()

# The old HTML
old_html = c[open_tag:end_pos]
print(f'Old nav HTML ({len(old_html)} bytes):')
print(old_html[:300])

# New HTML
new_html = """<nav class="bottom-nav">
      <button class="nav-item active" data-section="home">
        <span class="nav-item__icon">🏠</span>
        <span class="nav-item__label">学习</span>
      </button>
      <button class="nav-item" data-section="tools">
        <span class="nav-item__icon">🔧</span>
        <span class="nav-item__label">工具</span>
      </button>
      <button class="nav-item" data-section="mine">
        <span class="nav-item__icon">👤</span>
        <span class="nav-item__label">我的</span>
      </button>
    </nav>"""

c = c[:open_tag] + new_html + c[end_pos:]

# Also fix remaining old references in inline.js
# bottombar__icon → nav-item__icon, bottombar__label → nav-item__label
c = c.replace('bottombar__icon', 'nav-item__icon')
c = c.replace('bottombar__label', 'nav-item__label')
# Fix active class
c = c.replace('nav-item--active', 'nav-item active')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('\n✅ Nav HTML fully rebuilt')
print(f'Old: {len(old_html)} bytes → New: {len(new_html)} bytes')
