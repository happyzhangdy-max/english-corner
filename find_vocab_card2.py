"""Find levels rendering in inline.js"""
with open('inline.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The renderV function generates card HTML. Since it's minified,
# let me find the pattern where v.levels is used in string concat
import re
# Find all 'levels' references in the minified code
for m in re.finditer(r'\.levels[^;]{0,200}', content):
    pos = m.start()
    # Get line number
    line_num = content[:pos].count('\n') + 1
    before = content[max(0,pos-50):pos]
    after = content[pos:pos+250]
    print(f'--- Line ~{line_num} ---')
    print(f'...{before}[LEVELS]{after}...')
    print()
