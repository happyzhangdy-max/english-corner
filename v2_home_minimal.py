"""英语角v2.1 — 首页极简改造"""
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== 1. 替换首页(p-home)内容 =====
old_home_start = '<!-- 首页 -->'
old_home_end = '<!-- 词汇页 -->'

# 找到旧首页的范围
idx_start = html.find(old_home_start)
idx_end = html.find(old_home_end)

if idx_start == -1 or idx_end == -1:
    print('❌ 找不到首页标记')
    exit(1)

old_home = html[idx_start:idx_end]

new_home = """<!-- 首页 -->
<div class="main"><div class="page active" id="p-home">
  <!-- 品牌标题 - 极简 -->
  <div class="home-brand">
    <div class="home-brand-prefix">行小之的</div>
    <div class="home-brand-name">英语角</div>
    <div class="home-brand-slogan">✨ 快乐背单词</div>
  </div>

  <!-- 搜索框 C位 -->
  <div class="search-bar-wrap" style="margin:32px 0 40px">
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input class="search-input" id="aiSearchInput" type="text" placeholder="搜单词、搜例句，试试「abandon」" maxlength="200" autocomplete="off">
      <span class="search-clear" id="searchClear">✕</span>
      <button class="search-btn" id="searchBtn">搜索</button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>

  <!-- 核心功能入口 - 三卡片等宽 -->
  <div class="home-actions">
    <div class="home-card" onclick="go('scan')">
      <div class="home-card-icon">📸</div>
      <div class="home-card-label">拍照识图</div>
      <div class="home-card-desc">拍下即查</div>
    </div>
    <div class="home-card" onclick="go('autoplay')">
      <div class="home-card-icon">📚</div>
      <div class="home-card-label">自动背单词</div>
      <div class="home-card-desc">考级分类</div>
    </div>
    <div class="home-card" onclick="go('game')">
      <div class="home-card-icon">🎮</div>
      <div class="home-card-label">单词大冒险</div>
      <div class="home-card-desc">爬塔闯关</div>
    </div>
  </div>

  <!-- 底部留白 -->
  <div style="height:80px"></div>
</div>
"""

html = html[:idx_start] + new_home + html[idx_end:]

# ===== 2. 添加极简首页CSS =====
home_css = """
/* ===== 极简首页 ===== */
.home-brand {
  text-align: center;
  padding: 48px 0 0;
  user-select: none;
}
.home-brand-prefix {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  margin-bottom: 4px;
}
.home-brand-name {
  font-size: 40px;
  font-weight: 800;
  color: var(--text-brand);
  letter-spacing: 6px;
  line-height: 1.1;
}
.home-brand-slogan {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-tertiary);
  letter-spacing: 4px;
}

/* 核心功能卡片 */
.home-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 4px;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 28px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}
.home-card:hover {
  border-color: var(--brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--brand-glow);
}
.home-card:active {
  transform: scale(0.97);
}
.home-card-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 4px;
}
.home-card-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.home-card-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
}
"""

# 在最后一个 </style> 前插入
html = html.replace('</style>', home_css + '\n</style>')

# ===== 3. 简化Hero相关CSS（不再需要旧的hero样式但保留兼容） =====
# 把hero高度减小
html = html.replace(
  '.hero { position:relative; width:calc(100% + 32px); margin-left:-16px; margin-bottom:18px; height:200px; overflow:hidden; padding-top:0; background: linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-primary) 100%); }',
  '.hero { display:none; }'
)

# ===== 4. 删除不再需要的CSS规则 =====
# 删除 stats, h-entries, h-entry 相关（首页移除了这些）
# 但其他页面可能还在用，所以谨慎删除
# 检查其他页面是否有引用

# ===== 5. 保存 =====
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('✅ 首页极简改造完成')
print('  新首页: 品牌标题 → 搜索框 → 3核心功能卡')
print('  其他功能: 通过底部导航访问')
