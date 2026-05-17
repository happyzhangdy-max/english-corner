"""Check nav HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('id="bottombarNav"')
if idx >= 0:
    print(repr(c[idx-30:idx+50]))
else:
    print('not found')
    # check after replacement
    idx2 = c.find('bottom-nav')
    print('bottom-nav at:', idx2)
    if idx2 >= 0:
        print(repr(c[idx2-30:idx2+60]))
