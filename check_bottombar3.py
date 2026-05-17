"""Find exact bottombar HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find the CSS
i = c.find('.bottombar')
if i >= 0:
    line = c[max(0,i-5):i+30]
    print("CSS:", repr(line))
else:
    print("CSS .bottombar not found, checking raw bottombar...")
    j = c.find('bottombar')
    print("raw:", repr(c[j-5:j+30]))

# Find the HTML nav
i2 = c.find('class="bottombar"')
if i2 >= 0:
    print("nav tag:", repr(c[i2:i2+80]))
else:
    # try different class pattern
    for m in __import__('re').finditer(r'<div[^>]*bottombar', c):
        print("nav div:", m.group()[:100])
