"""清理重复注入的JS/CSS块"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 找到所有 "/* ===== 主题切换 ===== */" 的位置
marker = '/* ===== 主题切换 ===== */'
positions = []
start = 0
while True:
    pos = html.find(marker, start)
    if pos == -1:
        break
    # 找到对应的结束位置 "})();" 或下一个 marker 之前
    end_marker = '\n</script>'
    end_pos = html.find(end_marker, pos)
    if end_pos == -1:
        end_pos = pos + 500  # fallback
    else:
        end_pos = end_pos + len(end_marker)
    positions.append((pos, end_pos))
    start = end_pos

print(f'找到 {len(positions)} 个主题JS块')
for i, (s, e) in enumerate(positions):
    print(f'  [{i}] 行范围: {html[:s].count(chr(10))+1} - {html[:e].count(chr(10))+1}')

# 保留最后一个，删除前面的
if len(positions) > 1:
    for s, e in reversed(positions[:-1]):
        html = html[:s] + html[e:]
    print(f'已删除 {len(positions)-1} 个重复主题JS')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 验证
remaining = html.count(marker)
print(f'剩余主题JS块: {remaining}')
print('✅ 完成')
