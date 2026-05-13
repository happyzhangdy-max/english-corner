import re
with open('inline.js','r',encoding='utf-8') as f:
    c = f.read()

# Find GRAMMAR_DATA structure
idx = c.find('var GRAMMAR_DATA')
if idx == -1:
    idx = c.find('GRAMMAR_DATA=')
if idx >= 0:
    start = idx
    # Find the array start
    arr_start = c.find('[', start)
    if arr_start >= 0:
        # Get first few items of the array
        snippet = c[arr_start:arr_start+2000]
        print('GRAMMAR_DATA snippet (first 2000 chars):')
        print(snippet)
else:
    print('GRAMMAR_DATA not found directly')

# Also check quiz data
idx2 = c.find('QUIZ_DATA_HIGH')
if idx2 >= 0:
    print('\n=== QUIZ_DATA_HIGH found at', idx2, '===')
    print(c[idx2:idx2+500])
else:
    print('\nQUIZ_DATA_HIGH not found')
