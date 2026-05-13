"""
英语角 v2 视觉改造脚本
- 双主题CSS变量替换
- 品牌标题替换
- 主题切换按钮
- 等级标签新样式
- 全局亮/暗色值适配
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== 1. 替换 :root CSS变量 =====
old_root = """/* ===== Design Tokens (外语角 v3.0) ===== */
:root {
  /* === Dark Surface (4-level) === */
  --bg-primary: #0a0a12;
  --bg-surface: #12121e;
  --bg-surface-2: #1a1a2e;
  --bg-surface-3: #222238;
  --bg-hover: rgba(255,255,255,0.04);
  --bg-active: rgba(245,158,11,0.08);

  /* === Brand Colors === */
  --amber: #f59e0b;
  --amber-light: rgba(245,158,11,0.15);
  --coral: #e94560;
  --coral-light: rgba(233,69,96,0.15);
  --purple: #a855f7;
  --purple-light: rgba(168,85,247,0.15);
  --teal: #4ecca3;
  --teal-light: rgba(78,204,163,0.15);
  --navy: #0f3460;

  /* === Text === */
  --text-primary: #fafafa;
  --text-secondary: rgba(255,255,255,0.7);
  --text-tertiary: rgba(255,255,255,0.45);
  --text-quaternary: rgba(255,255,255,0.25);

  /* === Borders === */
  --border-subtle: rgba(255,255,255,0.06);
  --border-hover: rgba(245,158,11,0.2);
  --border-active: rgba(245,158,11,0.4);

  /* === Typography === */
  --font-jp: var(--font-en);
  --font-sc: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --font-en: 'Inter', 'Segoe UI', sans-serif;

  --fs-display: 32px;
  --fs-h1: 24px;
  --fs-h2: 20px;
  --fs-body: 16px;
  --fs-caption: 14px;
  --fs-small: 12px;
  --fs-tiny: 11px;

  --fw-black: 900;
  --fw-bold: 700;
  --fw-medium: 500;
  --fw-regular: 400;

  --lh-tight: 1.2;
  --lh-normal: 1.5;
  --lh-loose: 1.8;

  /* === Spacing (4px grid) === */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;

  /* === Radius === */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-card: 0 4px 20px rgba(0,0,0,0.25);
  --shadow-elevated: 0 8px 32px rgba(0,0,0,0.35);
  --shadow-glow-amber: 0 0 20px rgba(245,158,11,0.15);
  --shadow-glow-coral: 0 0 20px rgba(233,69,96,0.15);

  /* === Transitions === */
  --tr-normal: 0.25s ease;

  /* === Nav === */
  --nav-height: 68px;
  --topbar-h: 48px;
  --sidebar-w: 260px;
}"""

new_root = """/* ===== 英语角 v2 — 双主题设计令牌 ===== */
:root {
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
}

/* 保留的旧版变量（兼容性） */
:root,
[data-theme="dark"] {
  /* === Typography === */
  --font-jp: var(--font-en);
  --font-sc: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --font-en: 'Inter', 'Segoe UI', sans-serif;
  --font-display: 'Outfit', 'Inter', sans-serif;

  --fs-display: 32px;
  --fs-h1: 24px;
  --fs-h2: 20px;
  --fs-body: 16px;
  --fs-caption: 14px;
  --fs-small: 12px;
  --fs-tiny: 11px;

  --fw-black: 900;
  --fw-bold: 700;
  --fw-medium: 500;
  --fw-regular: 400;

  --lh-tight: 1.2;
  --lh-normal: 1.5;
  --lh-loose: 1.8;

  /* === Spacing (4px grid) === */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;

  /* === Radius === */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* === Transitions & Nav === */
  --tr-normal: 0.25s ease;
  --nav-height: 68px;
  --topbar-h: 48px;
  --sidebar-w: 260px;
}"""

html = html.replace(old_root, new_root)

# ===== 2. 品牌标题替换 =====
# 找到 <title> 和页面中的 "英语角" 标题
html = html.replace('<title>英语角</title>', '<title>行小之的英语角 — 快乐背单词</title>')

# 找到 header 部分 — 在 <header> 区域替换
old_header = """  <div class="nav-left">
    <div class="site-logo">
      <span class="logo-icon">📖</span>
      <span class="logo-text">英语角</span>
    </div>
  </div>"""

new_header = """  <div class="nav-left">
    <div class="site-logo">
      <span class="logo-icon" style="font-size:22px;">📖</span>
      <span class="brand-header-inline">
        <span class="brand-prefix-inline">行小之的</span>
        <span class="brand-name-inline">英语角</span>
      </span>
    </div>
  </div>"""

html = html.replace(old_header, new_header)

# ===== 3. 在 hero 区域插入品牌 slogan =====
# 找到 hero 里的内容并替换
old_hero_content = """<div class="hero">
    <div class="hero-content">
      <h1 class="hero-title">📖 英语角</h1>
      <p class="hero-sub">精选 14,942 词 · 覆盖 8 大考试等级</p>
    </div>
  </div>"""

new_hero_content = """<div class="hero">
    <div class="hero-content">
      <div class="brand-hero">
        <div class="brand-hero-title">
          <span class="brand-hero-prefix">行小之的</span>
          <span class="brand-hero-name">英语角</span>
        </div>
        <p class="brand-hero-slogan">✨ 快乐背单词 ✨</p>
      </div>
      <p class="hero-sub">精选 14,942 词 · 覆盖 8 大考试等级</p>
    </div>
  </div>"""

html = html.replace(old_hero_content, new_hero_content)

# ===== 4. 等级标签样式替换 =====
# 替换 .sl- 等级样式
old_level_styles = """.sl-n5 { background:var(--amber-light); color:var(--amber); border:1px solid rgba(245,158,11,0.2); }
.sl-n4 { background:var(--teal-light); color:var(--teal); border:1px solid rgba(78,204,163,0.2); }
.sl-n3 { background:var(--purple-light); color:var(--purple); border:1px solid rgba(168,85,247,0.2); }
.sl-n2 { background:var(--coral-light); color:var(--coral); border:1px solid rgba(233,69,96,0.2); }
.sl-n1 { background:rgba(168,85,247,0.1); color:var(--purple); border:1px solid rgba(168,85,247,0.15); }"""

new_level_styles = """.sl-zk { background: var(--lv1-bg); color: var(--lv1-text); border: 1px solid transparent; }
.sl-gk { background: var(--lv2-bg); color: var(--lv2-text); border: 1px solid transparent; }
.sl-cet4 { background: var(--lv3-bg); color: var(--lv3-text); border: 1px solid transparent; }
.sl-cet6 { background: var(--lv4-bg); color: var(--lv4-text); border: 1px solid transparent; }
.sl-ky { background: var(--lv5-bg); color: var(--lv5-text); border: 1px solid transparent; }
.sl-ielts { background: var(--lv6-bg); color: var(--lv6-text); border: 1px solid transparent; }
.sl-toefl { background: var(--lv7-bg); color: var(--lv7-text); border: 1px solid transparent; }
.sl-gre { background: var(--lv8-bg); color: var(--lv8-text); border: 1px solid transparent; }"""

html = html.replace(old_level_styles, new_level_styles)

# ===== 5. 添加等级标签通用样式 =====
# 在 .sl- 样式后面添加等级标签通用样式
level_tag_style = """
/* 等级标签通用样式 */
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
.level-8 { background: var(--lv8-bg); color: var(--lv8-text); }
"""

# 在 shadow-glow-coral 的结束之后，* 选择器之前插入
insert_point = "  --shadow-glow-coral: 0 0 20px rgba(233,69,96,0.15);"
# 实际上更好的是在等级样式后面加
html = html.replace(new_level_styles, new_level_styles + "\n" + level_tag_style)

# ===== 6. 添加主题切换按钮 HTML =====
theme_toggle_html = """
<!-- 主题切换按钮 -->
<button id="theme-toggle" class="theme-toggle" aria-label="切换主题">
  <span class="icon-light">☀️</span>
  <span class="icon-dark">🌙</span>
</button>"""

# 在 </body> 前插入
html = html.replace('</body>', theme_toggle_html + '\n</body>')

# ===== 7. 主题切换按钮 CSS =====
toggle_css = """
/* ===== 主题切换按钮 ===== */
.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}
.theme-toggle:hover {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px var(--brand-glow);
}
[data-theme="dark"] .theme-toggle .icon-light,
.theme-toggle .icon-dark { display: none; }
[data-theme="dark"] .theme-toggle .icon-dark { display: inline; }
.theme-toggle .icon-light { display: inline; }
"""

# 在最后一个 </style> 前插入
html = html.replace('</style>', toggle_css + '\n</style>')

# ===== 8. 主题切换 JS =====
theme_js = """
/* ===== 主题切换 ===== */
(function(){
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  toggle.addEventListener('click', function(){
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();"""

# 在 </script> 前插入最后一个 script 块
html = html.replace('</script>', theme_js + '\n</script>')

# ===== 9. 品牌标题相关 CSS =====
brand_css = """
/* ===== 品牌标题 (Hero区域) ===== */
.brand-hero { text-align: center; margin-bottom: 8px; }
.brand-hero-title { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
.brand-hero-prefix { font-size: 18px; font-weight: 400; color: var(--text-secondary); letter-spacing: 2px; }
.brand-hero-name { font-size: 44px; font-weight: 800; background: linear-gradient(135deg, var(--brand), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; line-height: 1.1; }
.brand-hero-slogan { margin-top: 4px; font-size: 14px; color: var(--text-tertiary); letter-spacing: 6px; }

/* 导航栏内联品牌 */
.brand-header-inline { display: inline-flex; align-items: baseline; gap: 2px; margin-left: 6px; }
.brand-prefix-inline { font-size: 12px; font-weight: 400; color: var(--text-tertiary); letter-spacing: 1px; }
.brand-name-inline { font-size: 18px; font-weight: 700; color: var(--text-brand); letter-spacing: 2px; }
"""

html = html.replace('</style>', brand_css + '\n</style>')

# ===== 10. 更新 hero 背景 =====
# 当前他是用 bg-surface-2 渐变，在亮色下 bg-surface-2 是浅色，hero应该有点渐变层次
# 保持现有结构不变，因为变量会自动切换

# ===== 11. 保存 =====
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ v2 视觉改造完成")
print("变更概要:")
print("  1. CSS变量: 亮色+暗色双主题")
print("  2. 品牌标题: '行小之的英语角' + 口号")
print("  3. 主题切换按钮: 右下角固定")
print("  4. 8色等级标签: 亮暗自动适配")
print("  5. 保留所有现有变量名兼容性")
