"""Find end of bottombar CSS block and HTML block"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# CSS block end — next section with /* =====
s = c.find('.bottombar {')
# Find the closing } of the .bottombar or the next section
remaining = c[s:]
depth = 0
in_block = False
for i, ch in enumerate(remaining):
    if ch == '{':
        depth += 1
        in_block = True
    elif ch == '}':
        if in_block:
            depth -= 1
            if depth == 0:
                css_end = s + i + 1
                print(f'CSS block end at {css_end}')
                print(f'After CSS: {repr(c[css_end:css_end+80])}')
                break

# Now find the HTML nav
h = c.find('<div class="bottombar" id="bottombarNav">')
if h >= 0:
    print(f'HTML nav start at {h}')
    # Find closing </div>
    remaining = c[h:]
    d = 0
    for i, ch in enumerate(remaining):
        if ch == '<' and remaining[i:i+4] == '<div':
            d += 1
        elif ch == '<' and remaining[i:i+5] == '</div':
            d -= 1
            if d == 0 and remaining[i+5:i+7] == '>\n':
                html_end = h + i + 7
                print(f'HTML nav end at {html_end}')
                print(f'Content: {repr(c[h:h+150])}')
                print(f'After: {repr(c[html_end:html_end+50])}')
                break
