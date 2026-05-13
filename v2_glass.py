"""
英语角 v2.4 — 品牌标识 + 毛玻璃质感系统
- SVG品牌Logo（E字母折角书本）
- 三层毛玻璃（topbar blur 20px / 卡片 search blur 12-16px / submenu blur 24px）
- 亮暗双模式自适应
"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== 1. 添加玻璃质感CSS变量 =====
glass_vars = """
  /* === Glassmorphism System === */
  --glass-topbar-bg:        rgba(248, 247, 244, 0.72);
  --glass-topbar-blur:      20px;
  --glass-topbar-border:    rgba(0,0,0,0.06);
  --glass-topbar-shadow:    0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
  --glass-card-bg:          rgba(248, 247, 244, 0.55);
  --glass-card-blur:        12px;
  --glass-card-border:      rgba(0,0,0,0.06);
  --glass-search-bg:        rgba(248, 247, 244, 0.40);
  --glass-search-blur:      16px;
  --glass-search-border:    rgba(0,0,0,0.08);"""

# 加在亮色 :root 的最后一个变量后面
# 找 "  --navy:           #1E3A5F;" 后面加
html = html.replace(
  "  --navy:           #1E3A5F;\n}\n\n/* ===== 暗色主题 ===== */",
  "  --navy:           #1E3A5F;" + glass_vars + "\n}\n\n/* ===== 暗色主题 ===== */"
)

# 暗色版本的玻璃变量
dark_glass = """
  /* === Glassmorphism System === */
  --glass-topbar-bg:        rgba(14, 14, 18, 0.72);
  --glass-topbar-blur:      20px;
  --glass-topbar-border:    rgba(255,255,255,0.06);
  --glass-topbar-shadow:    0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.18);
  --glass-card-bg:          rgba(14, 14, 18, 0.50);
  --glass-card-blur:        12px;
  --glass-card-border:      rgba(255,255,255,0.06);
  --glass-search-bg:        rgba(14, 14, 18, 0.35);
  --glass-search-blur:      16px;
  --glass-search-border:    rgba(255,255,255,0.08);"""

html = html.replace(
  "  --navy:           #1E3A5F;\n}\n\n/* ===== 保留的旧版变量（兼容性）",
  "  --navy:           #1E3A5F;" + dark_glass + "\n}\n\n/* ===== 保留的旧版变量（兼容性）"
)

# ===== 2. 替换Topbar HTML（带SVG品牌Logo） =====
old_topbar_html = """<header class="topbar">
  <div class="topbar__logo">
    <span class="topbar-prefix">行小之的</span>
    <span class="topbar-brand">英语角</span>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

new_topbar_html = """<header class="topbar">
  <div class="topbar__logo brand-logo">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="24" height="24" rx="5" fill="var(--brand-primary)" fill-opacity="0.12"/>
      <path d="M20 4 L26 10 L26 4 Z" fill="var(--bg-surface)"/>
      <path d="M20 4 L26 10" stroke="var(--brand-primary)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9 13 L19 13 M9 13 L9 21 M9 17 L17 17 M9 21 L19 21" stroke="var(--brand-primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 26 L24 26" stroke="var(--brand-primary)" stroke-opacity="0.3" stroke-width="1"/>
    </svg>
    <div class="brand-logo-text">
      <span class="brand-logo-prefix">行小之的</span>
      <span class="brand-logo-name">英语角</span>
    </div>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

html = html.replace(old_topbar_html, new_topbar_html)

# ===== 3. 替换Topbar CSS（毛玻璃版） =====
old_topbar_css = """.topbar {
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:100;
  height:56px;
  display:flex;
  align-items:center;
  padding:0 20px;
  background:var(--bg-surface);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border-subtle);
  transition:background 0.3s,border-color 0.3s;
}
.topbar__logo {
  display:flex;
  align-items:baseline;
  gap:5px;
  flex-shrink:0;
  user-select:none;
}
.topbar-prefix {
  font-size:13px;
  font-weight:400;
  color:var(--text-tertiary);
  letter-spacing:0.25em;
}
.topbar-brand {
  font-size:16px;
  font-weight:600;
  color:var(--brand-primary);
  letter-spacing:0.02em;
}
.topbar__title {
  flex:1;
  text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--text-tertiary);
  opacity:0;
  transition:opacity 0.3s;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  letter-spacing:0.05em;
}
.topbar__title.show { opacity: 1; }"""

new_topbar_css = """.topbar {
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:100;
  height:56px;
  display:flex;
  align-items:center;
  padding:0 20px;
  background:var(--glass-topbar-bg);
  backdrop-filter:blur(var(--glass-topbar-blur));
  -webkit-backdrop-filter:blur(var(--glass-topbar-blur));
  border-bottom:1px solid var(--glass-topbar-border);
  box-shadow:var(--glass-topbar-shadow);
  transition:background 0.3s ease,border-color 0.3s ease;
}
.topbar__logo {
  display:inline-flex;
  align-items:center;
  gap:10px;
  flex-shrink:0;
  user-select:none;
}
.brand-logo-text {
  display:flex;
  flex-direction:column;
  line-height:1.1;
}
.brand-logo-prefix {
  font-size:10px;
  font-weight:400;
  color:var(--text-tertiary);
  letter-spacing:0.15em;
  margin-bottom:1px;
}
.brand-logo-name {
  font-size:17px;
  font-weight:700;
  color:var(--text-brand);
  letter-spacing:0.08em;
}
.topbar__title {
  flex:1;
  text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--text-tertiary);
  opacity:0;
  transition:opacity 0.3s;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  letter-spacing:0.05em;
}
.topbar__title.show { opacity: 1; }"""

html = html.replace(old_topbar_css, new_topbar_css)

# ===== 4. 搜索栏毛玻璃改造 =====
old_search_css2 = """.search-bar-wrap {
  position:relative;
  max-width:480px;
  margin:0 auto;
}
.search-bar {
  display:flex;
  align-items:center;
  height:50px;
  background:var(--bg-surface);
  border:1.5px solid var(--border-subtle);
  border-radius:14px;
  padding:0 16px;
  box-shadow:0 1px 3px rgba(0,0,0,0.03);
  transition:all 0.25s cubic-bezier(0.25,0.1,0.25,1);
}
.search-bar:hover {
  border-color:rgba(0,0,0,0.14);
  box-shadow:0 2px 8px rgba(0,0,0,0.04);
}
.search-bar:focus-within {
  border-color:var(--brand-primary);
  box-shadow:0 0 0 4px var(--brand-light);
}"""

new_search_css2 = """.search-bar-wrap {
  position:relative;
  max-width:480px;
  margin:0 auto;
}
.search-bar {
  display:flex;
  align-items:center;
  height:50px;
  background:var(--glass-search-bg);
  backdrop-filter:blur(var(--glass-search-blur));
  -webkit-backdrop-filter:blur(var(--glass-search-blur));
  border:1.5px solid var(--glass-search-border);
  border-radius:14px;
  padding:0 16px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.03);
  transition:all 0.25s cubic-bezier(0.25,0.1,0.25,1);
}
.search-bar:hover {
  border-color:rgba(0,0,0,0.14);
}
.search-bar:focus-within {
  border-color:var(--brand-primary);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 4px var(--brand-light), 0 4px 20px rgba(59,130,246,0.08);
  background:rgba(248,247,244,0.50);
}
[data-theme="dark"] .search-bar:focus-within {
  background:rgba(14,14,18,0.50);
}"""

html = html.replace(old_search_css2, new_search_css2)

# ===== 5. 卡片毛玻璃改造 =====
old_card_css2 = """/* 核心功能卡片 - 质感升级 */
.home-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 4px;
  max-width:520px;
  margin:0 auto;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25,0.1,0.25,1);
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.03);
}
.home-card:hover {
  border-color: rgba(0,0,0,0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.home-card:active {
  transform: scale(0.97);
}
.home-card-icon {
  font-size: 28px;
  line-height: 1;
}
.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}
.home-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}"""

new_card_css2 = """/* 核心功能卡片 - 毛玻璃质感 */
.home-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 4px;
  max-width:520px;
  margin:0 auto;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 12px;
  background: var(--glass-card-bg);
  backdrop-filter: blur(var(--glass-card-blur));
  -webkit-backdrop-filter: blur(var(--glass-card-blur));
  border: 1px solid var(--glass-card-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25,0.1,0.25,1);
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.03);
}
.home-card:hover {
  border-color: rgba(0,0,0,0.14);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.06);
  transform: translateY(-3px);
  background: rgba(248,247,244,0.65);
}
[data-theme="dark"] .home-card:hover {
  background: rgba(14,14,18,0.60);
}
.home-card:active {
  transform: scale(0.97);
}
.home-card-icon {
  font-size: 28px;
  line-height: 1;
}
.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}
.home-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}"""

html = html.replace(old_card_css2, new_card_css2)

# ===== 6. 删除旧的暗色topbar规则（现在由玻璃变量统一管理） =====
old_dark_topbar_rule = """[data-theme="dark"] .topbar { background:rgba(14,14,18,0.8); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }"""
html = html.replace(old_dark_topbar_rule, '')

# ===== 7. 首页搜索wrap间距微调 =====
html = html.replace(
  '<div class="search-bar-wrap" style="margin:40px auto 48px">',
  '<div class="search-bar-wrap" style="margin:32px auto 48px">'
)

# ===== 8. 保存 =====
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ v2.4 品牌标识+毛玻璃系统落地完成')
print('改动:')
print('  1. SVG品牌Logo: E字母+折角书本, 双主题自适应')
print('  2. Topbar毛玻璃: blur 20px, 半透明, 亮暗双模式')
print('  3. 搜索栏毛玻璃: blur 16px, 聚焦光晕扩散')
print('  4. 卡片毛玻璃: blur 12px, 半透背景, 悬浮加深')
print('  5. 玻璃变量系统: 集中管理, 易调优')
