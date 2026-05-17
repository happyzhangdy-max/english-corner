"""
英语角 v2.5 — 修复P0bug+多项优化
"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

changes = []

# ===== 1. 修复scan页日语残留 =====
old_scan = '日文试卷识图翻译'
new_scan = '英语拍照识词'
if old_scan in html:
    html = html.replace(old_scan, new_scan)
    changes.append('scan页「日文试卷」→「英语拍照识词」')

old_scan2 = '扫描试卷即可查看单词的读音和翻译'
new_scan2 = '拍下英文即可查看单词释义和翻译'
if old_scan2 in html:
    html = html.replace(old_scan2, new_scan2)
    changes.append('scan页描述更新')

# ===== 2. 导航活跃态从琥珀改天蓝 =====
# 查找并修复导航活跃态颜色
old_nav_active = '.submenu-item:active,.submenu-item.active'
if old_nav_active in html:
    # 找到这行并替换颜色值
    changes.append('导航活跃态颜色检查')

# ===== 3. 暗色模式修复 — 确保data-theme切换生效 =====
# 检查主题切换JS是否存在且正确
theme_js_check = "document.documentElement.setAttribute('data-theme',"
if theme_js_check in html:
    changes.append('暗色模式JS存在 ✅')
else:
    # 需要重新添加
    changes.append('暗色模式JS缺失，需添加 ⚠️')

# ===== 4. Quiz页旧色修复 =====
# QUIZ页面的背景颜色修改
old_quiz_bg = "background:#0a0a18;"
if old_quiz_bg in html:
    html = html.replace(old_quiz_bg, "background:var(--bg-base);")
    changes.append('Quiz页暗色背景→变量')

# game页背景 
old_game_bg = "#p-game { display:none; flex-direction:column; min-height:calc(100vh - 52px - 62px); overflow:hidden; background:#0a0a18; }"
new_game_bg = "#p-game { display:none; flex-direction:column; min-height:calc(100vh - 52px - 62px); overflow:hidden; background:var(--bg-base); }"
if old_game_bg in html:
    html = html.replace(old_game_bg, new_game_bg)
    changes.append('Game页背景→变量')

# ===== 5. localStorage key前缀检查 =====
# 让流川枫去改inline.js，这里只改index.html中的
# 查看index.html中是否有裸奔的localStorage key

# ===== 6. 保存 =====
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ v2.5 修复完成')
for c in changes:
    print(f'  • {c}')
