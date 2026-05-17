"""Find search area CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
i = c.find('#searchArea')
if i >= 0:
    line = c[max(0,i-20):i+300]
    print(repr(line))
else:
    print('Not found, trying search...')
    i = c.find('searchArea')
    if i >= 0:
        print(repr(c[i:i+300]))
