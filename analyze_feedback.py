"""分析之哥反馈的问题"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. 主题切换按钮
print('=== 主题切换按钮 ===')
i = c.find('theme-toggle')
if i >= 0:
    lno = c[:i].count('\n') + 1
    print(f'参考: line ~{lno}')
    print(c[i:i+200])
    
# 2. bottom-nav 固定定位
print('\n=== bottom-nav positioning ===')
i = c.find('.bottom-nav {')
if i >= 0:
    j = c.find('}', i)
    print(c[i:j+1])

# 3. game页面
print('\n=== game page ===')
i = c.find('id="p-game"')
if i >= 0:
    j = c.find('>', i)
    surrounding = c[i:j+100]
    print(surrounding[:200])

# 4. 卡片标题 - "免费词库" 
print('\n=== home-card-label ===')
for m in __import__('re').finditer(r'home-card-label[^<]*</div>', c):
    lno = c[:m.start()].count('\n') + 1
    print(f'Line ~{lno}: {m.group()[:80]}')
