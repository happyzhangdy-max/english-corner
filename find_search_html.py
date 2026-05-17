"""Find search input HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
i = c.find('placeholder')
while i >= 0:
    line = c[max(0,i-80):i+120]
    if 'search' in line.lower() or '搜' in line or '查找' in line:
        lno = c[:i].count('\n') + 1
        print(f'Line ~{lno}: {repr(line)}')
    i = c.find('placeholder', i+1)
