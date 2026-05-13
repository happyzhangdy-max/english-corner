"""清理残留的渐变文字CSS"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 找到并替换所有残留的渐变文字
old = """  .h-entry-vocab .h-title { background:linear-gradient(135deg,#e94560,#ff6b9d); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .h-entry-grammar .h-title { background:linear-gradient(135deg,#f5a623,#ffd700); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .h-entry-review .h-title { background:linear-gradient(135deg,#4ecca3,#2ecc71); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .h-entry-game .h-title { background:linear-gradient(135deg,#a855f7,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .h-entry-autoplay .h-title { background:linear-gradient(135deg,#e94560,#ff6b9d); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }"""

new = """  .h-entry-vocab .h-title { color:var(--coral); }
  .h-entry-grammar .h-title { color:var(--amber); }
  .h-entry-review .h-title { color:var(--teal); }
  .h-entry-game .h-title { color:var(--purple); }
  .h-entry-autoplay .h-title { color:var(--coral); }"""

if old in html:
    html = html.replace(old, new)
    print('✅ 已替换h-entry渐变文字')
else:
    print('❌ 找不到精确匹配，尝试其他格式...')
    # 尝试不带缩进的格式
    old2 = old.replace('  .h', '.h')
    new2 = new.replace('  .h', '.h')
    if old2 in html:
        html = html.replace(old2, new2)
        print('✅ 已替换(无缩进)')
    else:
        print('❌ 仍然找不到')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

remaining = html.count('-webkit-background-clip:text')
print(f'剩余渐变文字数: {remaining}')
