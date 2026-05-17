"""Diff 流川枫的改动"""
with open(r'C:\Users\行之\.qwenpaw\workspaces\PysPBm\english_corner_inline.js', 'r', encoding='utf-8') as f:
    lcf = f.read()
with open(r'C:\workcraft\english-corner\inline.js', 'r', encoding='utf-8') as f:
    mine = f.read()

# Find differences in localStorage key patterns
import re
# Find all localStorage keys in 流川枫's version
lcf_keys = set(re.findall(r"localStorage\.(?:getItem|setItem)\('([^']+)'", lcf))
my_keys = set(re.findall(r"localStorage\.(?:getItem|setItem)\('([^']+)'", mine))

print("新增的 en_ 前缀 key:")
new_en = lcf_keys - my_keys
for k in sorted(new_en):
    print(f'  en_{k}' if not k.startswith('en_') else f'  {k}')

print("\n我有的 key 流川枫没有:")
missing = my_keys - lcf_keys
for k in sorted(missing):
    print(f'  {k}')

print("\n共有的 key:")
common = my_keys & lcf_keys
for k in sorted(common):
    print(f'  {k}')
