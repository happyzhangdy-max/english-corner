"""Fix brand-hero section"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Check brand-hero CSS
i = c.find('.brand-hero')
if i >= 0:
    e = c.find('}\n', i)
    print(f'Found: {c[i:e+2]}')
    
    # Add gradient background
    old = '.brand-hero {\n  text-align: center;\n  padding: 48px 24px 24px;\n}'
    new = '.brand-hero {\n  text-align: center;\n  padding: 48px 24px 24px;\n  position: relative;\n}\n.brand-hero::after {\n  content: \"\";\n  position: absolute;\n  top: -60px;\n  left: 50%;\n  transform: translateX(-50%);\n  width: 200px;\n  height: 200px;\n  background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);\n  pointer-events: none;\n  z-index: -1;\n}'
    if old in c:
        c = c.replace(old, new)
        print('✅ Hero区光晕背景已添加')
    else:
        print('Hero CSS格式不匹配')
        print(repr(c[i:e+2]))
else:
    print('brand-hero not found')
    
    # Try searching for the HTML hero section
    idx = c.find('快乐背单词')
    if idx >= 0:
        lno = c[:idx].count('\n') + 1
        print(f'Found slogan at line ~{lno}')
        print(repr(c[idx-100:idx+50]))

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
