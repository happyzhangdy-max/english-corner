with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

idx = c.find('function queueSpeak')
if idx >= 0:
    print(c[idx:idx+800])
else:
    # Try queueSpeak or initTTS
    idx2 = c.find('initTTS')
    if idx2 >= 0:
        print(c[idx2:idx2+600])
    
    idx3 = c.find('queueSpeak')
    if idx3 >= 0:
        print('\n=== queueSpeak ===')
        print(c[idx3:idx3+600])
