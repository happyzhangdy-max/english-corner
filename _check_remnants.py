with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find toggleKanji function
idx = c.find('function toggleKanji')
if idx >= 0:
    print(c[idx:idx+500])
else:
    print('toggleKanji not found')

# Check HTML for study card template
idx2 = c.find('彼女')
if idx2 >= 0:
    start = max(0, idx2-200)
    end = min(len(c), idx2+300)
    print('\n=== 彼女 context ===')
    print(c[start:end])

# Check the AI prompt template
idx3 = c.find('日文')
if idx3 >= 0:
    start = max(0, idx3-100)
    end = min(len(c), idx3+100)
    print('\n=== 日文 context ===')
    print(c[start:end])
