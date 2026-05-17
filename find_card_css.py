"""Find home action card CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

for cls in ['.home-actions', '.home-card-icon', '.home-card-label', '.home-card-desc',
            '.home-brand-prefix', '.home-brand-name', '.home-brand-slogan']:
    idx = c.find(cls)
    if idx >= 0:
        e = c.find('}', idx)
        print(f'{cls}: {c[idx:e+1]}')
        print()
