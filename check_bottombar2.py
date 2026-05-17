"""Find exact bottombar HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find the CSS
i = c.find('.bottombar')
if i >= 0:
    print('CSS:", repr(c[i:i+20]))
else:
    print('CSS .bottombar not found')
    j = c.find('bottombar')
    print('bottombar raw:', repr(c[j-5:j+15]))

# Find the HTML nav
i2 = c.find('bottombar__item')
if i2 >= 0:
    print('bottombar__item:', repr(c[i2:i2+50]))
