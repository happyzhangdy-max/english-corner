import re
with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()
funcs = re.findall(r'function\s+(\w+)\s*\(', c)
print('Functions found:')
for f in sorted(funcs):
    print(f'  {f}')
print(f'\nTotal: {len(funcs)}')
