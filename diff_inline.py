"""Merge 流川枫's localStorage fixes"""
with open(r'C:\Users\行之\.qwenpaw\workspaces\PysPBm\english_corner_inline.js', 'r', encoding='utf-8') as f:
    lcf = f.read()
with open(r'C:\workcraft\english-corner\inline.js', 'r', encoding='utf-8') as f:
    mine = f.read()

# Find difference
if len(lcf) != len(mine):
    print(f'Sizes differ: lcf={len(lcf)}, mine={len(mine)}')
    
# Get the localStorage key prefix changes
# The key mappings:
# gc → en_gc
# gm → en_gm  
# gb → en_gb
# mk → en_mk
# scanHist → en_scan_hist
# _search_cache → en_search_cache

# Find in my version
import re

# Check if my version already has these
for old_key, new_key in [("'gc'", "'en_gc'"), ("'gm'", "'en_gm'"), ("'gb'", "'en_gb'"),
                          ("'mk'", "'en_mk'"), ("'scanHist'", "'en_scan_hist'"),
                          ("'_search_cache'", "'en_search_cache'")]:
    old_count = mine.count(old_key)
    new_count = mine.count(new_key)
    print(f'{old_key} → {new_key}: old={old_count}, new={new_count}')
