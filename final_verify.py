"""最终验证"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

checks = [
    ('渐变文字残留', '-webkit-background-clip:text', 0),
    ('品牌色天蓝(亮)', '#3B82F6(亮色定义)', html.count('#3B82F6') >= 4),
    ('品牌色天蓝(暗)', '#60A5FA(暗色定义)', '#60A5FA' in html),
    ('暖白高级底', '#F8F7F4', '#F8F7F4' in html),
    ('Topbar前缀-行小之的', 'topbar-prefix', 'topbar-prefix' in html),
    ('Topbar品牌-英语角', 'topbar-brand', 'topbar-brand' in html),
    ('Topbar小蓝标-快乐背单词', 'topbar-tag', 'topbar-tag' in html),
    ('首页品牌-纯色天蓝', 'brand-primary', html.count('brand-primary') >= 2),
    ('首页口号-琥珀色', 'accent-amber', 'accent-amber' in html),
    ('功能卡片新样式', 'home-card', 'home-card' in html),
    ('等级标签新样式', 'grade-zhongkao', 'grade-zhongkao' in html),
    ('深色底升级', '#0E0E12', '#0E0E12' in html),
    ('卡片阴影-亮', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.04)' in html),
]

print('🔍 最终验证结果:')
all_pass = True
for name, pat, expected in checks:
    if isinstance(expected, int):
        actual = html.count(pat)
        status = '✅' if actual == expected else '⚠️'
        if actual != expected: all_pass = False
        print(f'  {status} {name}: 预期={expected}, 实际={actual}')
    else:
        status = '✅' if expected else '❌'
        if not expected: all_pass = False
        print(f'  {status} {name}')
    
print(f'\n{"🎉 全部通过" if all_pass else "⚠️ 有异常"}')
print(f'总行数: {html.count(chr(10))}')
