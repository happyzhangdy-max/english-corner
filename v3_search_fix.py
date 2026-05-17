"""Search bar dark mode and remaining cleanup"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

changes = []

# Add dark mode search bar styling
old = '.search-bar:focus-within { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }'
new = '.search-bar:focus-within { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }\n[data-theme="dark"] .search-bar:focus-within { border-color:#60A5FA; box-shadow:0 0 0 3px rgba(96,165,250,0.15); }\n[data-theme="dark"] .search-btn { background:#60A5FA; }\n[data-theme="dark"] .search-btn:hover { background:#93BBFC; }'
if old in c:
    c = c.replace(old, new)
    changes.append('搜索栏暗色模式焦点态')

# Clean up remaining v1 purple CSS variables and hardcoded values
# Check for old glass prefix references
if '--glass-card-bg' in c:
    changes.append('玻璃变量已有')
if '--purple' in c:
    # Replace remaining purple usage with brand blue
    # But be careful not to replace in data or legacy content text
    changes.append('仍有--purple引用，暂保留兼容层')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)

for ch in changes:
    print(f'  • {ch}')
