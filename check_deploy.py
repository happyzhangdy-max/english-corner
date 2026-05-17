"""Check deployed HTML"""
import urllib.request
r = urllib.request.urlopen('https://happyzhangdy-max.github.io/english-corner/', timeout=15)
html = r.read().decode('utf-8')
print(f'Size: {len(html)} bytes')
print(f'script src=: {html.count("<script src=")}')
print(f'/script: {html.count("</script>")}')
import re
for m in re.finditer(r'<script[^>]*>', html):
    print(f'  标签: {m.group()[:80]}')
print('= TTS 检查 =')
idx = html.find('_jaVoice')
if idx >= 0:
    print('❌ 还有 _jaVoice（旧版）')
else:
    print('✅ _jaVoice 已清理')
idx2 = html.find('_ttsVoice')
if idx2 >= 0:
    print('✅ _ttsVoice 已上线')
# Check scan page text
if '日文试卷' in html:
    print('❌ 还有「日文试卷」残留')
else:
    print('✅ scan页文本已修复')
# Check quiz bg
if '#0a0a18' in html:
    print('❌ 还有 #0a0a18 硬编码背景')
else:
    print('✅ quiz背景已修复')
