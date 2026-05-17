"""Add submenu CSS back (was lost during v3 nav rebuild)"""
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

submenu_css = """
/* ===== Submenu Overlay (浮窗式) ===== */
.submenu-overlay {
  position: fixed;
  bottom: 72px;
  left: 0;
  right: 0;
  z-index: 199;
  display: none;
  flex-direction: column;
  align-items: center;
  padding: 0 12px 0;
  pointer-events: none;
}
.submenu-overlay.open {
  display: flex;
}
.submenu-overlay.open .submenu-grid {
  pointer-events: auto;
}
.submenu-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(0,0,0,0.15);
  margin-bottom: 8px;
}
.submenu-grid {
  width: 100%;
  max-width: 480px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  pointer-events: auto;
}
.submenu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  background: transparent;
  border: none;
}
.submenu-item:hover {
  background: rgba(59,130,246,0.08);
}
.submenu-item:active {
  transform: scale(0.95);
}
.sub-icon {
  font-size: 24px;
  line-height: 1;
}
.sub-label {
  font-size: 11px;
  font-weight: 500;
  color: #1D1D1F;
}
[data-theme="dark"] .submenu-grid {
  background: rgba(24,24,29,0.92);
  border-color: rgba(255,255,255,0.06);
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
[data-theme="dark"] .sub-label {
  color: #F1F0ED;
}
[data-theme="dark"] .submenu-item:hover {
  background: rgba(96,165,250,0.15);
}
[data-theme="dark"] .submenu-handle {
  background: rgba(255,255,255,0.15);
}
"""

# Insert before the first .bottom-nav CSS rule
insert_point = c.find('.bottom-nav {')
if insert_point > 0:
    c = c[:insert_point] + submenu_css + "\n" + c[insert_point:]
    print(f'✅ Submenu CSS added ({len(submenu_css)} bytes) at position {insert_point}')
else:
    print('❌ .bottom-nav not found')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
