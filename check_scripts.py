"""检查script标签"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
scripts = re.findall(r'<script[^>]*>', html)
for s in scripts:
    print(s)

# Check for closing tags
print(f'\n</script> 出现次数: {html.count("</script>")}')
print(f'<script 出现次数: {html.count("<script")}')
