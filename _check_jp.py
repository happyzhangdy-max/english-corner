import re
with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find hiragana/katakana
jp_chars = re.findall(r'[\u3040-\u309F\u30A0-\u30FF]{2,}', c)
print(f'Hiragana/Katakana sequences found: {len(jp_chars)}')
if jp_chars:
    unique = list(set(jp_chars))
    print(f'Unique: {len(unique)}')
    print(f'Examples: {unique[:20]}')

# Find Japanese text patterns
jp_texts = re.findall(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}', c)
# Filter out common Chinese characters that overlap
print(f'\nTotal CJK sequences: {len(jp_texts)}')
