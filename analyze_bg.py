"""分析深色背景/遮罩问题"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
    
# 1. 检查各个页面的背景设置
for page_id in ['p-home', 'p-vocab', 'p-grammar', 'p-review', 'p-book', 'p-wrong', 'p-quiz', 'p-scan', 'p-game', 'p-autoplay']:
    i = c.find(f'id="{page_id}"')
    if i >= 0:
        lno = c[:i].count('\n') + 1
        print(f'{page_id}: line ~{lno}')
        # Check the style attribute if any
        surrounding = c[i:i+200]
        if 'style=' in surrounding:
            style_start = surrounding.find('style="') + 7
            style_end = surrounding.find('"', style_start)
            style = surrounding[style_start:style_end]
            print(f'  style: {style}')
    else:
        print(f'{page_id}: not found')

# 2. Check for any overlay/drawer components
print('\n=== Overlay/drawer containers ===')
for cls in ['overlay', 'drawer', 'modal', 'sheet', 'backdrop']:
    count = c.count(f'class="{cls}"') + c.count(f'class="{cls}-')
    if count > 0:
        print(f'  .{cls}: {count} occurrences')

# 3. Check .page background
print('\n=== Page background ===')
i = c.find('.page {')
if i >= 0:
    j = c.find('}', i)
    print(f'  .page: {c[i:j+1]}')
i2 = c.find('.page.active')
if i2 >= 0:
    j2 = c.find('}', i2)
    print(f'  .page.active: {c[i2:j2+1]}')
