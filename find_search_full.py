"""Get full search HTML structure"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
i = c.find('aiSearchInput')
if i >= 0:
    # Go back to find enclosing div
    start = c.rfind('<', i-200, i)
    end = c.find('>', i) + 100
    # Find next </div> to get full wrapper
    seg = c[start:end]
    # Find the next few closing blocks
    seg_end = c.find('</div>', end) + 6
    seg_full = c[start:seg_end]
    print(f'Full search HTML ({len(seg_full)} bytes):')
    print(seg_full)
