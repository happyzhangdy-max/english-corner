"""英语角项目现状扫描"""
import re

# 扫描 inline.js
with open('inline.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 功能入口
pages = re.findall(r"go\('(\w+)'\)", js)
print('=== 功能入口 ===')
for p in sorted(set(pages)):
    print(f'  {p}')

# 日语残留检查（非数据区）
non_data = js[:js.find('VOCAB_DATA')]
jp_chars = re.findall(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}', non_data)
print(f'\n=== 日语残留 ===')
print(f'  非数据区日文/中文片段: {len(jp_chars)}')
# 过滤掉常见中文词
import unicodedata
jp_only = [w for w in jp_chars if any('\u3040' <= c <= '\u30FF' for c in w)]
if jp_only:
    print(f'  含假名的: {jp_only[:15]}')

# 文件大小
print(f'\n=== 文件信息 ===')
print(f'  inline.js: {len(js)} bytes, {js.count(chr(10))} 行')
print(f'  data.js (VOCAB_DATA): {len(open("data.js","r",encoding="utf-8").read())} bytes')

# 扫描index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
print(f'  index.html: {len(html)} bytes, {html.count(chr(10))} 行')
