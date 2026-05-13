with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find study card HTML (the template with cfw, cfr, etc.)
idx = c.find('cfw')
if idx >= 0:
    start = max(0, idx-50)
    end = min(len(c), idx+500)
    print('=== cfw context ===')
    print(c[start:end])

print('\n\n=== showC function ===')
idx2 = c.find('function showC')
if idx2 >= 0:
    start = max(0, idx2)
    end = min(len(c), idx2+1500)
    print(c[start:end])
