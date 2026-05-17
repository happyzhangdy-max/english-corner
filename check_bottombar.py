"""Check bottombar in HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
i = c.find('bottombar')
if i >= 0:
    print('Found at:', i)
    print(repr(c[i:i+200]))
    print('Count:', c.count('bottombar'))
else:
    print('Not found')
    # Check if bottom-nav exists
    i2 = c.find('bottom-nav')
    if i2 >= 0:
        print('bottom-nav found at:', i2)
        print(repr(c[i2:i2+200]))
