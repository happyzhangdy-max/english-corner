"""英语角 v3 视觉重建计划
按宫城设计稿分批落地，先改最核心的底部导航"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

changes = []

# ===== Step 1: 底部导航CSS替换 =====
# 找到现有的.bottombar相关CSS并替换
old_bottombar_start = html.find('.bottombar {')
old_bottombar_end = html.find('}\n\n/* =====', old_bottombar_start)
if old_bottombar_start >= 0 and old_bottombar_end >= 0:
    old_section = html[old_bottombar_start:old_bottombar_end+1]
    
    new_bottombar_css = """.bottom-nav {
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
  margin: 0 auto 16px;
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
    html = html[:old_bottombar_start] + new_bottombar_css + html[old_bottombar_end+1:]
    changes.append('底部导航CSS完全重建 → 浮空毛玻璃pill风格')

# ===== Step 2: 全局CSS变量补充 =====
# 在CSS区域添加缺少的变量
new_vars = """
/* 暗色模式 - 宫城v3 */
[data-theme="dark"] {
  --brand-primary: #60A5FA;
  --brand-hover: #93BBFC;
  --brand-light: rgba(96, 165, 250, 0.15);
  --accent-amber: #FBBF24;
}
"""
# 在暗色变量区域后插入
dark_end = html.find('/* 保留的旧版变量（兼容性） */')
if dark_end > 0:
    # Check if these variables already exist
    if '--brand-primary: #60A5FA' not in html:
        html = html[:dark_end] + new_vars + '\n' + html[dark_end:]
        changes.append('暗色CSS变量补充(brand-primary/brand-light等)')

# ===== Step 3: 底部导航HTML替换 =====
# 将旧的bottombar HTML替换为新结构
old_nav_html = html.find('<div class="bottombar"')
old_nav_end = html.find('</div>\n\n<!--', old_nav_html) if old_nav_html >= 0 else -1
# Find the actual end
if old_nav_html >= 0:
    # Find </div> for the bottombar
    remaining = html[old_nav_html:]
    depth = 0
    end_idx = 0
    for i, c in enumerate(remaining):
        if c == '<' and remaining[i:i+5] == '<div ':
            depth += 1
        elif c == '<' and remaining[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                end_idx = old_nav_html + i + 6
                break
    
    if end_idx > 0:
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
        html = html[:old_nav_html] + new_nav_html + html[end_idx:]
        changes.append('底部导航HTML重建 → 3个button pill结构')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ v3 视觉重建 Step 1 完成')
for c in changes:
    print(f'  • {c}')
