"""Update home-brand CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find .home-brand CSS
i = c.find('.home-brand {')
if i >= 0:
    e = c.find('}\n', i)
    print(f'home-brand CSS: {c[i:e+2]}')
else:
    # Try finding via CSS rules
    for cls in ['.home-brand-prefix', '.home-brand-name', '.home-brand-slogan']:
        idx = c.find(cls)
        if idx >= 0:
            e = c.find('}', idx)
            print(f'{cls}: {c[idx:e+1][:200]}')
            print()
