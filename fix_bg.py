"""Fix page backgrounds and dark mode"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# 1. 确保所有.page都有正确的背景色
old_page_css = '.page { display:none; max-width:960px; margin:0 auto; padding:16px; }'
new_page_css = '.page { display:none; max-width:960px; margin:0 auto; padding:16px; background: transparent; }'
if old_page_css in c:
    c = c.replace(old_page_css, new_page_css)
    changes.append('页面背景设置透明，继承主题背景')

# 2. 修复残留的深色背景 — 查找还在用深色硬编码的页面
# 搜索页面中残留的深色背景
for old_bg in ['#0a0a18', '#1a1a2e', '#0e0e12']:
    count = c.count(old_bg)
    if count > 0 and 'var(' not in c[c.find(old_bg)-10:c.find(old_bg)+len(old_bg)+10]:
        print(f'残留深色 {old_bg}: {count}处')

# 3. 优化深色模式切换按钮样式 — 让它在亮色下是白底浅边框
old_toggle = '.theme-toggle {\n  position: fixed;\n  bottom: 24px;'
# Already has styling, just add dark mode link

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

for ch in changes:
    print(f'  • {ch}')
