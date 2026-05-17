"""英语角 v3 视觉落地第二阶段"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# ===== 1. 等级标签CSS → 全新8色阶pill系统 =====
old_lvl_start = c.find('/* Level tag */')
old_lvl_end = c.find('/* ===== Quiz', old_lvl_start)
if old_lvl_end < 0:
    old_lvl_end = c.find('/* =====', old_lvl_start + 50)

print(f'Level CSS start={old_lvl_start}, end={old_lvl_end}')

if old_lvl_start > 0 and old_lvl_end > old_lvl_start:
    old_lvl_css = c[old_lvl_start:old_lvl_end]
    new_lvl_css = """/* Level tags — 8色阶pill系统 */
.vc .vl,
.vc .vt .vl {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-family: var(--font-en);
  border: 1px solid transparent;
}
.vc .vl.l3, .vc .vt .vl.l3 { background: rgba(52,211,153,0.15); color: #34D399; border-color: rgba(52,211,153,0.15); }
.vc .vl.l2, .vc .vt .vl.l2 { background: rgba(34,211,238,0.15); color: #22D3EE; border-color: rgba(34,211,238,0.15); }
.vc .vl.l1, .vc .vt .vl.l1 { background: rgba(96,165,250,0.15); color: #60A5FA; border-color: rgba(96,165,250,0.15); }
.vc .vl.l0, .vc .vt .vl.l0 { background: rgba(129,140,248,0.15); color: #818CF8; border-color: rgba(129,140,248,0.15); }
.vc .vl.lp, .vc .vt .vl.lp { background: rgba(167,139,250,0.15); color: #A78BFA; border-color: rgba(167,139,250,0.15); }
.vc .vl.li, .vc .vt .vl.li { background: rgba(251,146,60,0.15); color: #FB923C; border-color: rgba(251,146,60,0.15); }
.vc .vl.lt, .vc .vt .vl.lt { background: rgba(6,182,212,0.15); color: #06B6D4; border-color: rgba(6,182,212,0.15); }
.vc .vl.lg, .vc .vt .vl.lg { background: rgba(244,63,94,0.15); color: #F43F5E; border-color: rgba(244,63,94,0.15); }

"""
    c = c[:old_lvl_start] + new_lvl_css + c[old_lvl_end:]
    changes.append(f'等级标签8色阶pill系统 ({len(old_lvl_css)}→{len(new_lvl_css)} bytes)')

# ===== 2. 搜索栏品牌焦点态 =====
# Find existing search bar CSS
old_search_start = c.find('/* Search bar */')
old_search_end = c.find('/* =====', old_search_start + 20) if old_search_start >= 0 else -1

if old_search_start > 0 and old_search_end > old_search_start:
    old_search_css = c[old_search_start:old_search_end]
    new_search_css = """/* Search bar — 品牌焦点态 */
.search-wrap {
  max-width: 480px;
  margin: 0 auto 24px;
  padding: 0 20px;
}
#searchArea {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 14px;
  padding: 0 8px 0 16px;
  height: 48px;
  transition: all 200ms ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
#searchArea:focus-within {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12), 0 2px 8px rgba(59,130,246,0.06);
}
#searchArea input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1D1D1F;
  outline: none;
  height: 100%;
}
#searchArea input::placeholder { color: #A1A1A1; }
#searchArea button {
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  border: none;
  background: #3B82F6;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}
#searchArea button:hover { background: #2563EB; }
#searchArea button:active { transform: scale(0.96); }
[data-theme="dark"] #searchArea {
  background: #18181D;
  border-color: rgba(255,255,255,0.06);
}
[data-theme="dark"] #searchArea:focus-within {
  box-shadow: 0 0 0 3px rgba(96,165,250,0.15), 0 2px 8px rgba(96,165,250,0.06);
}

"""
    c = c[:old_search_start] + new_search_css + c[old_search_end:]
    changes.append(f'搜索栏品牌焦点态 ({len(old_search_css)}→{len(new_search_css)} bytes)')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('✅ v3 视觉落地 Phase 2 完成')
for ch in changes:
    print(f'  • {ch}')
