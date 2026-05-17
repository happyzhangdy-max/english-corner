"""Replace all #1a1a2e with CSS variables"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

count_before = c.count('#1a1a2e')

# Replace #1a1a2e used as background → use var(--bg-surface)
# Be careful: some might be used in gradients or other contexts
# Most common pattern: background:#1a1a2e
# Replace globally - #1a1a2e is an old dark color that should not appear in the v3 theme
c = c.replace('#1a1a2e', 'var(--bg-surface)')

# But --bg-surface in light mode was supposed to be something neutral
# In light mode: --bg-surface should be #FFFFFF or #F8F7F4
# Let me check what --bg-surface is set to
import re
for m in re.finditer(r'--bg-surface:\s*([^;]+)', c):
    print(f'--bg-surface = {m.group(1)}')

count_after = c.count('var(--bg-surface)')
print(f'#1a1a2e 替换: {count_before} → 0 (变为 var(--bg-surface) x{count_after})')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

# Also check .search-results since it had #1a1a2e background
i = c.find('.search-results')
if i >= 0:
    j = c.find('}', i)
    print(f'.search-results after fix: {c[i:j+1]}')
