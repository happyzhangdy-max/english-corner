"""Find submenu overlay"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
    
i = c.find('submenu')
if i >= 0:
    seg = c[i:i+800]
    print(seg[:800])
    
print('\n=== Submenu CSS ===')
j = c.find('.submenu-overlay')
if j >= 0:
    k = c.find('}\n', j)
    print(c[j:k+2])
j = c.find('.submenu-grid')
if j >= 0:
    k = c.find('}\n', j)
    print(c[j:k+2])
