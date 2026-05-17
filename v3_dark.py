"""完善暗色模式"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# 1. 更新暗色模式变量区域 — 补全缺失的变量
old_dark_vars = """[data-theme="dark"] {
  /* Background System */
  --bg-base:        #0E0E12;
  --bg-primary:     #0E0E12;
  --bg-surface:     #18181D;
  --bg-card:        #222228;"""

# Check if this exact block exists
if old_dark_vars in c:
    # The dark mode variables exist but might be incomplete
    # Let's check what's after
    idx = c.find(old_dark_vars)
    end = c.find('\n}\n', idx)
    dark_section = c[idx:end+3]
    print(f'Current dark vars section ({len(dark_section)} bytes)')
    
    # Add missing variables if they don't exist
    if '--brand-primary' not in dark_section or '#60A5FA' not in dark_section:
        new_vars = """
  /* Brand - Dark Mode */
  --brand-primary:  #60A5FA;
  --brand-hover:    #93BBFC;
  --brand-light:    rgba(96, 165, 250, 0.15);
  --accent-amber:   #FBBF24;
  /* Text */
  --text-primary:   #F1F0ED;
  --text-secondary: rgba(241, 240, 237, 0.60);
  --text-tertiary:  rgba(241, 240, 237, 0.35);
  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  /* Shadows */
  --shadow-card:    0 2px 8px rgba(0,0,0,0.20);
"""
        # Insert before the closing }
        insert_pos = end
        c = c[:insert_pos] + new_vars + c[insert_pos:]
        changes.append(f'补全暗色模式变量 ({len(new_vars)} bytes)')
else:
    changes.append('dark vars已有')

# 2. 为首页暗色模式补充
# 搜索栏、卡片等的暗色模式已经通过变量处理
# 需要检查关键元素

# 3. 主题切换按钮样式
old_toggle = '.theme-toggle {\n  position: fixed;\n  bottom: 24px;'
if old_toggle in c:
    # Add dark mode for theme toggle
    old = '.theme-toggle:active {\n    transform: scale(0.92);\n  }'
    new = '.theme-toggle:active {\n    transform: scale(0.92);\n  }\n  [data-theme="dark"] .theme-toggle {\n    background: rgba(255,255,255,0.08);\n    border-color: rgba(255,255,255,0.08);\n  }'
    if old in c:
        c = c.replace(old, new)
        changes.append('主题按钮暗色模式')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('✅ 暗色模式完善')
for ch in changes:
    print(f'  • {ch}')
