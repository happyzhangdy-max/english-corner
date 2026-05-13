"""验证英语角v2改造效果"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

checks = [
    ('品牌标题', '行小之的英语角'),
    ('口号', '快乐背单词'),
    ('亮色背景', '#FFFDF5'),
    ('暗色主题', '[data-theme="dark"]'),
    ('主题切换JS', 'localStorage.setItem'),
    ('主题切换按钮', 'theme-toggle'),
    ('等级标签-中考', '.sl-zk'),
    ('等级标签-GRE', '.sl-gre'),
    ('等级变量lv1', '--lv1-bg'),
    ('等级变量lv8', '--lv8-bg'),
    ('品牌色天蓝', '--brand: #3B82F6'),
    ('品牌前缀', '行小之的'),
    ('hero品牌名', 'brand-hero-name'),
    ('导航品牌', 'brand-name-inline'),
]

for name, pat in checks:
    cnt = html.count(pat)
    status = '✅' if cnt > 0 else '❌'
    print(f'  {status} {name}: {pat[:35]} ({cnt}x)')

print(f'\n总行数: {html.count(chr(10))}')
print(f'文件大小: {len(html)} 字节')

# 检查重复项
dup_checks = ['data-theme="dark"', 'theme-toggle', 'brand-hero-name']
for pat in dup_checks:
    cnt = html.count(pat)
    if cnt > 2:
        print(f'  ⚠️ 可能重复: {pat} ({cnt}x)')
