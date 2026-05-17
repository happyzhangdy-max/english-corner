"""Application des nouveaux textes de positionnement"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changements = []

# 1. Slogan
old_slogan = '✨</span> 快乐背单词'
new_slogan = '✨</span> 快乐背单词 · 免费又全能'
if old_slogan in c:
    c = c.replace(old_slogan, new_slogan)
    changements.append('Slogan: 快乐背单词 → 快乐背单词 · 免费又全能')

# 2. Search placeholder
old_ph = '搜单词、搜例句，试试「abandon」'
new_ph = '搜单词 · 搜例句 · 拍照即查 — 试试「abandon」'
if old_ph in c:
    c = c.replace(old_ph, new_ph)
    changements.append('搜索框placeholder更新')

# 3. Feature card descriptions
old_desc1 = '拍下即查'
new_desc1 = '一拍即查，自动入生词本'
c = c.replace(f'<div class="home-card-desc">{old_desc1}</div>',
               f'<div class="home-card-desc">{new_desc1}</div>')
changements.append('卡片1描述: 拍下即查 → 一拍即查，自动入生词本')

old_desc2 = '考级分类'
new_desc2 = '考级全免费，0元学'
c = c.replace(f'<div class="home-card-desc">{old_desc2}</div>',
               f'<div class="home-card-desc">{new_desc2}</div>')
changements.append('卡片2描述: 考级分类 → 考级全免费，0元学')

old_desc3 = '爬塔闯关'
new_desc3 = '爬塔拳击，快乐背单词'
c = c.replace(f'<div class="home-card-desc">{old_desc3}</div>',
               f'<div class="home-card-desc">{new_desc3}</div>')
changements.append('卡片3描述: 爬塔闯关 → 爬塔拳击，快乐背单词')

# 4. 卡片1标题
old_label1 = '拍照识图'
new_label1 = '拍照识图'

# 5. 卡片2标题
old_label2 = '自动背单词'
new_label2 = '免费词库'
c = c.replace(f'<div class="home-card-label">{old_label2}</div>',
               f'<div class="home-card-label">{new_label2}</div>')
changements.append('卡片2标题: 自动背单词 → 免费词库')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('✅ 文案更新完成')
for ch in changements:
    print(f'  • {ch}')
