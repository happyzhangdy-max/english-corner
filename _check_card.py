with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find the study card HTML template
idx = c.find('彼女')
if idx >= 0:
    print('=== Study card template (around 彼女) ===')
    start = max(0, idx-500)
    end = min(len(c), idx+1000)
    print(c[start:end])

print('\n\n=== _jaVoice context ===')
idx2 = c.find('_jaVoice')
if idx2 >= 0:
    print(c[idx2:idx2+300])
