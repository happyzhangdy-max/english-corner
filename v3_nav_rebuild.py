"""Replace all bottombar CSS and HTML with new bottom-nav design"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# 1. Replace CSS: .bottombar through .bottombar__item--active blocks
# Find where .bottombar starts
s = c.find('.bottombar {')
print(f'bottombar CSS starts at: {s}')

# Find the end — look for the next non-bottombar major section
# The bottombar CSS blocks end with .bottombar__item--active ...
# Then .vc .vl etc. starts
next_section = c.find('\n/* Level tag */', s)
if next_section < 0:
    next_section = c.find('/* =====', s+100)

print(f'Next section at: {next_section}')

new_bottom_css = """.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 72px;
  margin: 0 12px 16px;
  padding: 0 4px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  max-width: 480px;
  left: 50%;
  transform: translateX(-50%);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 80px;
  height: 48px;
  padding: 8px 20px;
  border-radius: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  position: relative;
  color: #9CA3AF;
}
.nav-item:active {
  transform: scale(0.95);
}
.nav-item__icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 200ms ease;
  color: #9CA3AF;
}
.nav-item__label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #9CA3AF;
}
.nav-item.active {
  background: rgba(59, 130, 246, 0.12);
}
.nav-item.active .nav-item__label {
  color: #3B82F6;
  font-weight: 600;
}
.nav-item.active .nav-item__icon {
  color: #3B82F6;
}
@media (hover: hover) {
  .nav-item:hover:not(.active) {
    background: rgba(0, 0, 0, 0.03);
  }
  .nav-item:hover:not(.active) .nav-item__label,
  .nav-item:hover:not(.active) .nav-item__icon {
    color: #6B7280;
  }
}
[data-theme="dark"] .bottom-nav {
  background: rgba(24, 24, 29, 0.9);
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
[data-theme="dark"] .nav-item.active {
  background: rgba(96, 165, 250, 0.15);
}
[data-theme="dark"] .nav-item.active .nav-item__label,
[data-theme="dark"] .nav-item.active .nav-item__icon {
  color: #60A5FA;
}
[data-theme="dark"] .nav-item .nav-item__label,
[data-theme="dark"] .nav-item .nav-item__icon {
  color: rgba(241, 240, 237, 0.35);
}

"""

if next_section > s:
    old_css = c[s:next_section]
    c = c[:s] + new_bottom_css + c[next_section:]
    changes.append(f'底部导航CSS替换 ({len(old_css)}→{len(new_bottom_css)} bytes)')
    print(f'Replaced CSS: {len(old_css)} bytes → {len(new_bottom_css)} bytes')
else:
    print('Could not find next section boundary')

# 2. Replace HTML nav structure
old_nav = '<div class="bottombar" id="bottombarNav">'
h = c.find(old_nav)
if h >= 0:
    # Find the closing </div>
    remaining = c[h:]
    d = 0
    end_pos = -1
    for i, ch in enumerate(remaining):
        if ch == '<' and remaining[i:i+4] == '<div':
            d += 1
        elif ch == '<' and remaining[i:i+6] == '</div>':
            d -= 1
            if d == 0:
                end_pos = h + i + 6
                break
    if end_pos > h:
        old_nav_html = c[h:end_pos]
        new_nav_html = """<nav class="bottom-nav">
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
        c = c[:h] + new_nav_html + c[end_pos:]
        changes.append(f'底部导航HTML替换 ({len(old_nav_html)}→{len(new_nav_html)} bytes)')
        print('Replaced HTML nav')
    else:
        print('Could not find end of nav div')
else:
    print('Nav HTML not found')

# 3. Update JS references — bottombar__item → nav-item
c = c.replace('bottombar__item', 'nav-item')
c = c.replace('bottombar__item--active', 'nav-item.active')
c = c.replace('class="bottombar" id="bottombarNav"', 'class="bottom-nav"')
changes.append('JS中bottombar__item → nav-item 引用替换')

with open('index.html', 'r', encoding='utf-8') as f:
    original = f.read()

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print(f'\nDone. Changes: {len(changes)}')
for ch in changes:
    print(f'  • {ch}')
