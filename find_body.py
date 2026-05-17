"""Find body HTML content"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

body = c.find('<body')
if body >= 0:
    # Extract body content up to the search bar
    html_content = c[body:body+5000]
    # Show the body content
    idx = html_content.find('search-bar')
    if idx >= 0:
        # Show everything before search-bar
        print('Before search-bar:')
        print(html_content[:idx][:2000])
