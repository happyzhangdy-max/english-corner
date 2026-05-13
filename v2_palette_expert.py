"""
英语角 v2.2 — 专家级配色方案落地
- 去掉所有渐变文字，纯色天蓝品牌
- 背景色阶精简为3层
- topbar/首页品牌标题协调统一
- 等级标签改为纯色+透明底
"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== 1. 替换CSS变量块 =====
old_root = """:root {
  /* 亮色主题 (默认) ===== */

  /* 品牌色 */
  --brand: #3B82F6;
  --brand-light: #60A5FA;
  --brand-dark: #2563EB;
  --brand-glow: rgba(59, 130, 246, 0.15);

  /* 背景层级 (4层) */
  --bg-primary: #FFFDF5;
  --bg-surface: #F8F6F0;
  --bg-surface-2: #F0EDE3;
  --bg-surface-3: #FFFFFF;
  --bg-hover: #E8E4D8;
  --bg-active: rgba(59, 130, 246, 0.08);
  --bg-card: #FFFFFF;

  /* 文字层级 */
  --text-primary: #1A1A2E;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-quaternary: rgba(0, 0, 0, 0.15);
  --text-inverse: #FFFFFF;
  --text-brand: #3B82F6;

  /* 边框 & 分割 */
  --border-subtle: #E5E7EB;
  --border-hover: rgba(59, 130, 246, 0.2);
  --border-active: rgba(59, 130, 246, 0.4);

  /* 阴影 (亮色下轻盈) */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.10);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);

  /* 品牌点缀色 (亮色版) */
  --amber: #F59E0B;
  --amber-light: rgba(245, 158, 11, 0.12);
  --coral: #EF4444;
  --coral-light: rgba(239, 68, 68, 0.12);
  --purple: #8B5CF6;
  --purple-light: rgba(139, 92, 246, 0.12);
  --teal: #10B981;
  --teal-light: rgba(16, 185, 129, 0.12);
  --navy: #1E3A5F;

  /* ===== 等级标签色 (亮色) ===== */
  --lv1-bg: #DCFCE7;  --lv1-text: #166534;
  --lv2-bg: #CFFAFE;  --lv2-text: #155E75;
  --lv3-bg: #DBEAFE;  --lv3-text: #1E40AF;
  --lv4-bg: #E0E7FF;  --lv4-text: #3730A3;
  --lv5-bg: #F3E8FF;  --lv5-text: #6B21A8;
  --lv6-bg: #FCE7F3;  --lv6-text: #9D174D;
  --lv7-bg: #FFF7ED;  --lv7-text: #9A3412;
  --lv8-bg: #FEE2E2;  --lv8-text: #991B1B;
}

/* ===== 暗色主题 ===== */
[data-theme="dark"] {
  --brand: #3B82F6;
  --brand-light: #60A5FA;
  --brand-dark: #1D4ED8;
  --brand-glow: rgba(59, 130, 246, 0.25);

  --bg-primary: #0E0E1A;
  --bg-surface: #151528;
  --bg-surface-2: #1A1A2E;
  --bg-surface-3: #222240;
  --bg-hover: #222240;
  --bg-active: rgba(59, 130, 246, 0.15);
  --bg-card: #1A1A2E;

  --text-primary: #F0F0F5;
  --text-secondary: #9CA3AF;
  --text-tertiary: #6B7280;
  --text-quaternary: rgba(255, 255, 255, 0.2);
  --text-inverse: #0E0E1A;
  --text-brand: #60A5FA;

  --border-subtle: #2D2D4A;
  --border-hover: rgba(59, 130, 246, 0.3);
  --border-active: rgba(59, 130, 246, 0.5);

  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);

  --amber: #FBBF24;
  --amber-light: rgba(251, 191, 36, 0.2);
  --coral: #F87171;
  --coral-light: rgba(248, 113, 113, 0.2);
  --purple: #A78BFA;
  --purple-light: rgba(167, 139, 250, 0.2);
  --teal: #34D399;
  --teal-light: rgba(52, 211, 153, 0.2);
  --navy: #1E3A5F;

  --lv1-bg: #064E3B;  --lv1-text: #6EE7B7;
  --lv2-bg: #164E63;  --lv2-text: #67E8F9;
  --lv3-bg: #1E3A5F;  --lv3-text: #93C5FD;
  --lv4-bg: #2E2A6E;  --lv4-text: #A5B4FC;
  --lv5-bg: #3B1F5E;  --lv5-text: #C084FC;
  --lv6-bg: #4C1D3D;  --lv6-text: #F9A8D4;
  --lv7-bg: #4A2E1A;  --lv7-text: #FDBA74;
  --lv8-bg: #4C1D1D;  --lv8-text: #FCA5A5;
}"""

new_root = """:root,
[data-theme="light"] {
  /* Background System */
  --bg-base:        #F8F7F4;
  --bg-primary:     #F8F7F4;
  --bg-surface:     #FFFFFF;
  --bg-surface-2:   #F0EFEB;
  --bg-surface-3:   #FFFFFF;
  --bg-card:        #FFFFFF;
  --bg-hover:       rgba(59,130,246,0.06);
  --bg-active:      rgba(59,130,246,0.08);

  /* Brand System */
  --brand-primary:  #3B82F6;
  --brand-hover:    #2563EB;
  --brand-light:    rgba(59,130,246,0.12);
  --brand-subtle:   #EFF6FF;
  --brand:          #3B82F6;
  --brand-light:    #60A5FA;
  --brand-dark:     #2563EB;
  --brand-glow:     rgba(59,130,246,0.12);
  --text-brand:     #3B82F6;

  /* Accent (仅图标/热力标记/收藏) */
  --accent-amber:   #F59E0B;
  --accent-light:   rgba(245,158,11,0.12);
  --amber:          #F59E0B;
  --amber-light:    rgba(245,158,11,0.12);

  /* Text System */
  --text-primary:   #1D1D1F;
  --text-secondary: #6B6B6B;
  --text-tertiary:  #A1A1A1;
  --text-quaternary: rgba(0,0,0,0.10);
  --text-inverse:   #FFFFFF;

  /* Borders */
  --border-subtle:  rgba(0,0,0,0.06);
  --border-default: rgba(0,0,0,0.10);
  --border-hover:   rgba(59,130,246,0.25);
  --border-active:  rgba(59,130,246,0.5);

  /* Shadows */
  --shadow-card:    0 2px 8px rgba(0,0,0,0.04);
  --shadow-elevated: 0 8px 24px rgba(0,0,0,0.08);
  --shadow-sm:      0 1px 3px rgba(0,0,0,0.03);

  /* Semantic */
  --success:        #10B981;
  --error:          #EF4444;
  --warning:        #F59E0B;
  --info:           #3B82F6;
  --coral:          #EF4444;
  --coral-light:    rgba(239,68,68,0.12);
  --purple:         #8B5CF6;
  --purple-light:   rgba(139,92,246,0.12);
  --teal:           #10B981;
  --teal-light:     rgba(16,185,129,0.12);
  --navy:           #1E3A5F;
}

/* ===== 暗色主题 ===== */
[data-theme="dark"] {
  /* Background System */
  --bg-base:        #0E0E12;
  --bg-primary:     #0E0E12;
  --bg-surface:     #18181D;
  --bg-surface-2:   #222228;
  --bg-surface-3:   #2A2A32;
  --bg-card:        #18181D;
  --bg-hover:       rgba(96,165,250,0.08);
  --bg-active:      rgba(96,165,250,0.12);

  /* Brand System (暗色提亮) */
  --brand-primary:  #60A5FA;
  --brand-hover:    #93BBFC;
  --brand-light:    rgba(96,165,250,0.15);
  --brand-subtle:   rgba(96,165,250,0.05);
  --brand:          #60A5FA;
  --brand-light:    #93BBFC;
  --brand-dark:     #3B82F6;
  --brand-glow:     rgba(96,165,250,0.2);
  --text-brand:     #60A5FA;

  /* Accent */
  --accent-amber:   #FBBF24;
  --accent-light:   rgba(251,191,36,0.12);
  --amber:          #FBBF24;
  --amber-light:    rgba(251,191,36,0.12);

  /* Text System */
  --text-primary:   #F1F0ED;
  --text-secondary: rgba(241,240,237,0.60);
  --text-tertiary:  rgba(241,240,237,0.35);
  --text-quaternary: rgba(255,255,255,0.12);
  --text-inverse:   #1D1D1F;

  /* Borders */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-hover:   rgba(96,165,250,0.3);
  --border-active:  rgba(96,165,250,0.5);

  /* Shadows */
  --shadow-card:    0 2px 8px rgba(0,0,0,0.20);
  --shadow-elevated: 0 8px 24px rgba(0,0,0,0.35);
  --shadow-sm:      0 1px 3px rgba(0,0,0,0.15);

  /* Semantic (暗色版) */
  --success:        #34D399;
  --error:          #F87171;
  --warning:        #FBBF24;
  --info:           #60A5FA;
  --coral:          #F87171;
  --coral-light:    rgba(248,113,113,0.15);
  --purple:         #A78BFA;
  --purple-light:   rgba(167,139,250,0.15);
  --teal:           #34D399;
  --teal-light:     rgba(52,211,153,0.15);
  --navy:           #1E3A5F;
}"""

html = html.replace(old_root, new_root)

# ===== 2. 替换topbar HTML =====
old_topbar = """<header class="topbar">
  <div class="topbar__logo">
    <span class="topbar__main">行小之的英语角</span>
    <span class="topbar__sub">快乐背单词</span>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

new_topbar = """<header class="topbar">
  <div class="topbar__logo">
    <span class="topbar-prefix">行小之的</span>
    <span class="topbar-brand">英语角</span>
    <span class="topbar-tag">快乐背单词</span>
  </div>
  <span class="topbar__title" id="topbarTitle"></span>
</header>"""

html = html.replace(old_topbar, new_topbar)

# ===== 3. 替换topbar CSS（移除旧的，添加新的） =====
# 旧的topbar样式 - 替换为新样式
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
  background:rgba(10,10,18,0.85);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border-subtle);
  transition:background 0.3s,border-color 0.3s;
}
.topbar__logo { display: flex; flex-direction: column; line-height: 1.2; flex-shrink: 0; }
.topbar__main {
  font-family:var(--font-jp);
  font-size:16px;
  font-weight:700;
  color:var(--text-primary);
  transition:color 0.3s;
}
.topbar__sub { font-size: 10px; color: var(--text-tertiary); letter-spacing: 2px; font-weight: 500; }
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

html = html.replace(old_topbar_css, new_topbar_css)

# ===== 4. 替换首页品牌标题CSS =====
old_brand_css = """.home-brand {
  text-align: center;
  padding: 48px 0 0;
  user-select: none;
}
.home-brand-prefix {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: 4px;
}
.home-brand-name {
  font-size: 40px;
  font-weight: 800;
  color: var(--text-brand);
  letter-spacing: 6px;
  line-height: 1.1;
}
.home-brand-slogan {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-tertiary);
  letter-spacing: 4px;
}"""

new_brand_css = """/* 品牌标题 - 纯色天蓝无渐变 */
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

html = html.replace(old_brand_css, new_brand_css)

# ===== 5. 替换功能卡片CSS =====
old_card_css = """/* 核心功能卡片 */
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
  gap: 6px;
  padding: 28px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}
.home-card:hover {
  border-color: var(--brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--brand-glow);
}
.home-card:active {
  transform: scale(0.97);
}
.home-card-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 4px;
}
.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.home-card-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
}"""

new_card_css = """/* 核心功能卡片 - 极简高级 */
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

html = html.replace(old_card_css, new_card_css)

# ===== 6. 替换等级标签CSS =====
old_lvl_css = """.sl-zk { background: var(--lv1-bg); color: var(--lv1-text); border: 1px solid transparent; }
.sl-gk { background: var(--lv2-bg); color: var(--lv2-text); border: 1px solid transparent; }
.sl-cet4 { background: var(--lv3-bg); color: var(--lv3-text); border: 1px solid transparent; }
.sl-cet6 { background: var(--lv4-bg); color: var(--lv4-text); border: 1px solid transparent; }
.sl-ky { background: var(--lv5-bg); color: var(--lv5-text); border: 1px solid transparent; }
.sl-ielts { background: var(--lv6-bg); color: var(--lv6-text); border: 1px solid transparent; }
.sl-toefl { background: var(--lv7-bg); color: var(--lv7-text); border: 1px solid transparent; }
.sl-gre { background: var(--lv8-bg); color: var(--lv8-text); border: 1px solid transparent; }"""

new_lvl_css = """/* 等级标签 - 纯色文字+12%透明底色 */
.sl-zk { color: #22D3EE; background: rgba(34,211,238,0.12); border: none; }
.sl-gk { color: #60A5FA; background: rgba(96,165,250,0.12); border: none; }
.sl-cet4 { color: #818CF8; background: rgba(129,140,248,0.12); border: none; }
.sl-cet6 { color: #A78BFA; background: rgba(167,139,250,0.12); border: none; }
.sl-ky { color: #C084FC; background: rgba(192,132,252,0.12); border: none; }
.sl-ielts { color: #FB923C; background: rgba(251,146,60,0.12); border: none; }
.sl-toefl { color: #F87171; background: rgba(248,113,113,0.12); border: none; }
.sl-gre { color: #F43F5E; background: rgba(244,63,94,0.12); border: none; }"""

html = html.replace(old_lvl_css, new_lvl_css)

# ===== 7. 更新等级标签通用样式（去掉旧的lv变量相关） =====
# 找到并替换 .level-tag 通用样式
old_level_tag = """/* 等级标签通用样式 */
.level-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.level-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.level-1 { background: var(--lv1-bg); color: var(--lv1-text); }
.level-2 { background: var(--lv2-bg); color: var(--lv2-text); }
.level-3 { background: var(--lv3-bg); color: var(--lv3-text); }
.level-4 { background: var(--lv4-bg); color: var(--lv4-text); }
.level-5 { background: var(--lv5-bg); color: var(--lv5-text); }
.level-6 { background: var(--lv6-bg); color: var(--lv6-text); }
.level-7 { background: var(--lv7-bg); color: var(--lv7-text); }
.level-8 { background: var(--lv8-bg); color: var(--lv8-text); }"""

new_level_tag = """/* 等级标签通用样式 */
.level-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  border: none;
}
.grade-elementary { color: #34D399; background: rgba(52,211,153,0.12); }
.grade-zhongkao   { color: #22D3EE; background: rgba(34,211,238,0.12); }
.grade-gaokao     { color: #60A5FA; background: rgba(96,165,250,0.12); }
.grade-cet4       { color: #818CF8; background: rgba(129,140,248,0.12); }
.grade-cet6       { color: #A78BFA; background: rgba(167,139,250,0.12); }
.grade-kaoyan     { color: #C084FC; background: rgba(192,132,252,0.12); }
.grade-ielts      { color: #FB923C; background: rgba(251,146,60,0.12); }
.grade-toefl      { color: #F87171; background: rgba(248,113,113,0.12); }
.grade-gre        { color: #F43F5E; background: rgba(244,63,94,0.12); }"""

html = html.replace(old_level_tag, new_level_tag)

# ===== 8. 删除旧的brand-hero CSS（不再使用） =====
# 搜索并删除 brand-hero 相关CSS（首页已有新的home-brand）
old_brand_hero_css = """.brand-hero { text-align: center; margin-bottom: 8px; }
.brand-hero-title { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
.brand-hero-prefix { font-size: 18px; font-weight: 400; color: var(--text-secondary); letter-spacing: 2px; }
.brand-hero-name { font-size: 44px; font-weight: 800; background: linear-gradient(135deg, var(--brand), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; line-height: 1.1; }
.brand-hero-slogan { margin-top: 4px; font-size: 14px; color: var(--text-tertiary); letter-spacing: 6px; }"""

html = html.replace(old_brand_hero_css, '')

# ===== 9. 更新 body::after 渐变（亮色下不需要深色覆盖） =====
html = html.replace(
  'body::after { content:\'\'; position:fixed; inset:0; background:linear-gradient(180deg, rgba(10,10,18,0.25) 0%, rgba(10,10,18,0.75) 35%, var(--bg-primary) 100%); z-index:0; pointer-events:none; }',
  'body::after { content:\'\'; position:fixed; inset:0; background:linear-gradient(180deg, var(--bg-surface-2) 0%, transparent 40%); z-index:0; pointer-events:none; opacity:0.3; }'
)

# ===== 10. 保存 =====
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ 专家级配色方案落地完成')
print('变更:')
print('  1. CSS变量: 新色板+旧名兼容')
print('  2. Topbar: 行小之的(灰) + 英语角(深色) + 快乐背单词(天蓝pill)')
print('  3. 品牌标题: 纯色天蓝36px 900w, 无渐变')
print('  4. 功能卡片: 白底+浅灰边框+悬浮天蓝')
print('  5. 等级标签: 纯色文字+12%透明底色')
print('  6. 所有渐变文字已移除')
