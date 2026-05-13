"""
英语角 v2.3 — 高级感全面提升
- Topbar极简重构（去掉pill，品牌标识合一）
- 搜索框精致化（居中限宽+foucs动画）
- 卡片质感升级（内阴影+微动效）
- 间距系统优化（留白加大）
- 字体质感提升（字距/平滑）
"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== 1. Topbar HTML 极简化 =====
old_topbar = """<header class="topbar">
  <div class="topbar__logo">
    <span class="topbar-prefix">行小之的</span>
    <span class="topbar-brand">英语角</span>
    <span class="topbar-tag">快乐背单词</span>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

new_topbar = """<header class="topbar">
  <div class="topbar__logo">
    <span class="topbar-prefix">行小之的</span>
    <span class="topbar-brand">英语角</span>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

html = html.replace(old_topbar, new_topbar)

# ===== 2. Topbar CSS 升级 =====
old_topbar_css = """.topbar {
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:100;
  height:var(--topbar-h);
  display:flex;
  align-items:center;
  padding:0 16px;
  background:var(--bg-surface);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border-subtle);
  transition:background 0.3s,border-color 0.3s;
}
.topbar__logo { display:flex; align-items:center; gap:0; flex-shrink:0; }
.topbar-prefix { font-size:12px; font-weight:400; color:var(--text-tertiary); letter-spacing:0.5px; margin-right:4px; }
.topbar-brand { font-size:16px; font-weight:700; color:var(--text-primary); letter-spacing:0.3px; }
.topbar-tag { display:inline-flex; align-items:center; margin-left:10px; padding:2px 10px; border-radius:9999px; font-size:11px; font-weight:600; color:#FFFFFF; background:var(--brand-primary); line-height:1.5; }
.topbar__title {
  flex:1;
  text-align:center;
  font-size:14px;
  font-weight:500;
  color:var(--text-secondary);
  opacity:0;
  transition:opacity 0.3s;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
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

html = html.replace(old_topbar_css, new_topbar_css)

# ===== 3. 首页品牌区域升级 =====
old_brand_css = """/* 品牌标题 - 纯色天蓝无渐变 */
.home-brand {
  text-align: center;
  padding: 56px 20px 0;
  user-select: none;
}
.home-brand-prefix {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-tertiary);
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.home-brand-name {
  font-size: 36px;
  font-weight: 900;
  color: var(--brand-primary);
  line-height: 1.1;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.home-brand-slogan {
  font-size: 16px;
  font-weight: 500;
  color: var(--accent-amber);
  letter-spacing: 0.5px;
}"""

new_brand_css = """/* 品牌标题 - 纯色天蓝无渐变 */
.home-brand {
  text-align: center;
  padding: 56px 20px 0;
  user-select: none;
}
.home-brand-prefix {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary);
  letter-spacing: 0.25em;
  margin-bottom: 8px;
}
.home-brand-name {
  font-size: 38px;
  font-weight: 800;
  color: var(--brand-primary);
  line-height: 1.1;
  margin-bottom: 16px;
  letter-spacing: -0.015em;
}
.home-brand-slogan {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  font-size:14px;
  font-weight:500;
  color:var(--accent-amber);
  letter-spacing:0.08em;
}"""

html = html.replace(old_brand_css, new_brand_css)

# ===== 4. 搜索框质感升级 =====
# 替换搜索框样式
old_search_css = """.search-bar-wrap { position:relative; max-width:100%; margin:0 auto; }
.search-bar { display:flex; align-items:center; background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:4px 16px; transition:all 0.3s; }
.search-bar:focus-within { border-color:var(--brand); box-shadow:0 0 0 3px var(--brand-glow); }"""

new_search_css = """.search-bar-wrap {
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

html = html.replace(old_search_css, new_search_css)

# ===== 5. 搜索框内元素调整 =====
old_search_icon = ".search-icon { font-size:16px; margin-right:8px; color:var(--text-tertiary); }"
new_search_icon = ".search-icon { font-size:16px; margin-right:8px; color:var(--text-tertiary); flex-shrink:0; }"
html = html.replace(old_search_icon, new_search_icon)

old_search_input = ".search-input { flex:1; border:none; background:transparent; color:var(--text-primary); font-size:15px; outline:none; min-width:0; width:100%; font-family:var(--font-en); }"
new_search_input = ".search-input { flex:1; border:none; background:transparent; color:var(--text-primary); font-size:15px; outline:none; min-width:0; width:100%; font-family:var(--font-en); height:100%; }"
html = html.replace(old_search_input, new_search_input)

old_search_btn = ".search-btn { background:var(--brand); color:#fff; border:none; border-radius:8px; padding:5px 14px; font-size:13px; font-weight:600; cursor:pointer; transition:opacity 0.2s,background 0.2s; white-space:nowrap; flex-shrink:0; }"
new_search_btn = ".search-btn { background:var(--brand-primary); color:#fff; border:none; border-radius:10px; padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer; transition:opacity 0.2s,background 0.2s; white-space:nowrap; flex-shrink:0; letter-spacing:0.02em; }"
html = html.replace(old_search_btn, new_search_btn)

old_search_clear = ".search-clear { display:none; font-size:14px; color:var(--text-tertiary); cursor:pointer; padding:4px 6px; margin-right:4px; }"
new_search_clear = ".search-clear { display:none; font-size:14px; color:var(--text-tertiary); cursor:pointer; padding:4px 6px; margin-right:4px; flex-shrink:0; }"
html = html.replace(old_search_clear, new_search_clear)

# ===== 6. 首页搜索区间距调整 =====
old_search_wrap_margin = """<div class="search-bar-wrap" style="margin:32px 0 40px">"""
new_search_wrap_margin = """<div class="search-bar-wrap" style="margin:40px auto 48px">"""
html = html.replace(old_search_wrap_margin, new_search_wrap_margin)

# ===== 7. 功能卡片质感升级 =====
old_card_css = """/* 核心功能卡片 - 极简高级 */
.home-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 4px;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  box-shadow: var(--shadow-card);
}
.home-card:hover {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-elevated);
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
  letter-spacing: 0.5px;
}
.home-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}"""

new_card_css = """/* 核心功能卡片 - 质感升级 */
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

html = html.replace(old_card_css, new_card_css)

# ===== 8. 首页HTML微调 - 移除home-brand-slogan的旧结构 =====
old_slogan_html = """    <div class="home-brand-slogan">✨ 快乐背单词</div>"""
new_slogan_html = """    <div class="home-brand-slogan"><span>✨</span> 快乐背单词</div>"""
html = html.replace(old_slogan_html, new_slogan_html)

# ===== 9. 全局body字体渲染提升 =====
old_body_font = "body { font-family:var(--font-sc); background:var(--bg-primary); color:var(--text-primary); min-height:100vh; position:relative; scroll-padding-top:52px; }"
new_body_font = "body { font-family:var(--font-sc); background:var(--bg-primary); color:var(--text-primary); min-height:100vh; position:relative; scroll-padding-top:56px; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }"
html = html.replace(old_body_font, new_body_font)

# ===== 10. 暗色topbar毛玻璃效果 =====
old_dark_topbar = """[data-theme="dark"] .theme-toggle { display: inline; }"""
html = html.replace(old_dark_topbar, """[data-theme="dark"] .theme-toggle .icon-dark { display: inline; }
[data-theme="dark"] .topbar { background:rgba(14,14,18,0.8); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }""")

# 保存
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ v2.3 高级感提升完成')
print('改动:')
print('  1. Topbar: 56px, 去掉pill, 品牌色英语角')
print('  2. 品牌区: 字距拉开, slogan重构')
print('  3. 搜索框: 限宽480px居中, 14px圆角, 聚焦动画')
print('  4. 卡片: 16px圆角, 内阴影, 悬浮微动效')
print('  5. 间距: 40-48px呼吸区')
print('  6. 字体: 抗锯齿渲染')
