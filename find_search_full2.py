"""Get broader search HTML"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
i = c.find('search-icon')
if i >= 0:
    start = c.rfind('<div', i-100, i)
    if start < 0:
        start = max(0, i-100)
    end = c.find('</div>', i) + 6
    # Keep going to find possibly nested end
    # Find the next 3 div endings after this
    seg = c[start:i+500]
    # Find the wrapper div end
    depth = 1
    pos = start + 4
    while depth > 0 and pos < len(c):
        if c[pos:pos+4] == '<div':
            depth += 1
            pos += 4
        elif c[pos:pos+5] == '</div':
            depth -= 1
            pos += 5
        else:
            pos += 1
    seg = c[start:pos+1]
    print(f'Full wrapper ({len(seg)} bytes, depth 0 at {pos+1}):')
    print(seg)
