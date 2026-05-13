with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()
# Search for grammar/语法 related content
import re
matches = list(re.finditer(r'(grammar|语法|GRAMMAR|grammar_data)', c, re.IGNORECASE))
for m in matches[:10]:
    start = max(0, m.start()-50)
    end = min(len(c), m.end()+50)
    print(f'At {m.start()}: ...{c[start:end]}...')
    print()
print(f'Total matches: {len(matches)}')
