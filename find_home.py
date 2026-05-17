"""Check home page structure"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find p-home
i = c.find('id="p-home"')
if i >= 0:
    e = c.find('</div>', i)
    # Get more context
    segment = c[i:i+3000]
    print(segment[:2000])
else:
    print('p-home not found')
