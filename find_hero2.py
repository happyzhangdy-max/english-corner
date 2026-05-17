"""Find visible hero text"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
# Search for the brand title in visible content
# Skip the <title> tag
idx = c.find('</title>')
visible = c[idx+8:]
# Look for "英语角"
i = visible.find('英语角')
if i >= 0:
    ctx = visible[max(0,i-80):i+80]
    lno = c[:idx+8+i].count('\n') + 1
    print(f'Line ~{lno}: {repr(ctx)}')
else:
    print('"英语角" not found in visible HTML')
    # Try without the 英语角 text
    # The hero is probably in a div with some class
    for tag in ['hero', 'brand', 'banner']:
        i = visible.find(tag)
        if i >= 0:
            lno = c[:idx+8+i].count('\n') + 1
            print(f'tag "{tag}" at line {lno}: {repr(visible[i:i+80])}')
