with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find the speak function
idx = c.find('function speak(')
if idx >= 0:
    print('=== speak() ===')
    print(c[idx:idx+800])

print('\n=== function speakW ===')
idx2 = c.find('function speakW')
if idx2 >= 0:
    print(c[idx2:idx2+500])
