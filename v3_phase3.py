"""英语角 v3 视觉落地 Phase 3 — 卡片统一 + Hero区"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# ===== 1. Hero区光晕背景 =====
# 在.brand-hero区域添加radial-gradient光晕背景
old_hero = '.brand-hero {\n  text-align: center;\n  padding: 48px 24px 24px;\n}'
new_hero = '.brand-hero {\n  text-align: center;\n  padding: 48px 24px 24px;\n  position: relative;\n}\n.brand-hero::after {\n  content: \"\";\n  position: absolute;\n  top: -60px;\n  left: 50%;\n  transform: translateX(-50%);\n  width: 200px;\n  height: 200px;\n  background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);\n  pointer-events: none;\n  z-index: -1;\n}'
if old_hero in c:
    c = c.replace(old_hero, new_hero)
    changes.append('Hero区光晕背景')

# ===== 2. 首页功能卡片统一样式 =====
# 查找.home-card样式
old_home_card = c.find('.home-card {\n  background: var(--bg-card);\n  border-radius: 12px;\n')
if old_home_card >= 0:
    # Find the end of the .home-card block and related blocks
    end = c.find('}\n\n/* =====', old_home_card)
    if end > old_home_card:
        new_cards = """/* ===== 功能卡片（v3统一设计） ===== */
.home-card {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.02);
  transition: all 200ms cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}
.home-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03);
  transform: translateY(-2px);
  border-color: rgba(0,0,0,0.08);
}
.home-card:active {
  transform: translateY(0) scale(0.98);
}
.home-card-icon {
  font-size: 28px;
  margin-bottom: 8px;
  display: block;
}
.home-card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0 0 4px;
}
.home-card p {
  font-size: 12px;
  color: #6B6B6B;
  margin: 0;
  line-height: 1.4;
}
[data-theme="dark"] .home-card {
  background: #18181D;
  border-color: rgba(255,255,255,0.06);
}
[data-theme="dark"] .home-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

"""
        old = c[old_home_card:end]
        c = c[:old_home_card] + new_cards + c[end:]
        changes.append(f'首页卡片统一样式 ({len(old)}→{len(new_cards)} bytes)')

# ===== 3. Topbar统一 =====
# 查找Topbar样式
old_topbar = c.find('.topbar {\n')
if old_topbar >= 0:
    end = c.find('}\n\n/* =====', old_topbar)
    if end > old_topbar:
        new_topbar = """.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: transparent;
  height: auto;
}
.topbar-logo {
  display: flex;
  align-items: baseline;
  gap: 6px;
  text-decoration: none;
}
.topbar-prefix {
  font-size: 12px;
  font-weight: 400;
  color: #A1A1A1;
}
.topbar-name {
  font-size: 17px;
  font-weight: 700;
  color: #1D1D1F;
}
.topbar-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  background: #3B82F6;
  color: #FFFFFF;
  margin-left: 6px;
}
[data-theme="dark"] .topbar-name { color: #F1F0ED; }
[data-theme="dark"] .topbar-prefix { color: rgba(241,240,237,0.35); }

"""
        old = c[old_topbar:end]
        c = c[:old_topbar] + new_topbar + c[end:]
        changes.append(f'Topbar统一 ({len(old)}→{len(new_topbar)} bytes)')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('✅ v3 Phase 3 完成')
for ch in changes:
    print(f'  • {ch}')
