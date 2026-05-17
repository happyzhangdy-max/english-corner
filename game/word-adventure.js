/**
 * word-adventure.js v1 — 单词大冒险（干净重写，不继承日语角代码）
 * 
 * 英语8级体系：zk/gk/cet4/cet6/ky/ielts/toefl/gre
 * 模式：快速匹配 / 限时挑战
 */
;(function() {
'use strict';

const MODES = {
  match: { name: '快速匹配', desc: '无限答题，答对得分答错扣血', icon: '⚡' },
  timed: { name: '限时挑战', desc: '60秒内尽可能多答对', icon: '⏱️' },
};

const LEVEL_NAMES = {
  zk: { label: '中考', color: '#22c55e' },
  gk: { label: '高考', color: '#3b82f6' },
  cet4: { label: '四级', color: '#8b5cf6' },
  cet6: { label: '六级', color: '#a855f7' },
  ky: { label: '考研', color: '#ec4899' },
  ielts: { label: '雅思', color: '#f59e0b' },
  toefl: { label: '托福', color: '#ef4444' },
  gre: { label: 'GRE', color: '#dc2626' },
};

let state = {
  mode: 'match',
  level: null,
  pool: [],
  idx: 0,
  score: 0,
  hp: 5,
  maxHp: 5,
  combo: 0,
  maxCombo: 0,
  correct: 0,
  wrong: 0,
  playing: false,
  timer: null,
  timeLeft: 60,
};

function init() {
  var container = document.getElementById('p-game');
  if (!container) return;
  
  // Remove placeholder
  container.innerHTML = '';
  container.style.padding = '0';
  container.style.background = 'transparent';
  
  renderMenu(container);
}

function renderMenu(container) {
  var levels = Object.keys(LEVEL_NAMES);
  var cards = levels.map(function(lv) {
    var info = LEVEL_NAMES[lv];
    return '<button class="wa-level-btn" data-level="'+lv+'" style="background:linear-gradient(135deg,'+info.color+'22,'+info.color+'11);border:1px solid '+info.color+'44;color:'+info.color+'" onclick="WordAdventure.start(\''+lv+'\')">'+
      '<span class="wa-level-icon" style="background:'+info.color+'22">'+getLevelIcon(lv)+'</span>'+
      '<span class="wa-level-label">'+info.label+'</span>'+
      '<span class="wa-level-badge" style="background:'+info.color+'">'+lv.toUpperCase()+'</span>'+
    '</button>';
  }).join('');

  container.innerHTML = 
    '<div class="wa-menu">'+
      '<div class="wa-hero">'+
        '<div class="wa-hero-icon">🎮</div>'+
        '<h2 class="wa-hero-title">单词大冒险</h2>'+
        '<p class="wa-hero-desc">选择难度，开始挑战</p>'+
      '</div>'+
      '<div class="wa-level-grid">'+cards+'</div>'+
    '</div>';
}

function getLevelIcon(lv) {
  var icons = { zk:'🌱', gk:'📚', cet4:'🔥', cet6:'⚡', ky:'💪', ielts:'💎', toefl:'🌍', gre:'👑' };
  return icons[lv] || '📖';
}

function start(level) {
  state.level = level;
  state.score = 0;
  state.hp = 5;
  state.maxHp = 5;
  state.combo = 0;
  state.maxCombo = 0;
  state.correct = 0;
  state.wrong = 0;
  state.idx = 0;
  
  // Filter vocab by level
  var all = window.VOCAB || [];
  state.pool = all.filter(function(v) { return v.level === level; });
  
  if (state.pool.length < 4) {
    showToast('该级别词汇不足（<4个），请选择其他难度');
    return;
  }
  
  // Shuffle
  state.pool = state.pool.sort(function() { return Math.random() - 0.5; });
  
  showModeSelect();
}

function showModeSelect() {
  var container = document.getElementById('p-game');
  var modes = Object.keys(MODES).map(function(k) {
    var m = MODES[k];
    return '<button class="wa-mode-btn" onclick="WordAdventure.startMode(\''+k+'\')">'+
      '<span class="wa-mode-icon">'+m.icon+'</span>'+
      '<span class="wa-mode-name">'+m.name+'</span>'+
      '<span class="wa-mode-desc">'+m.desc+'</span>'+
    '</button>';
  }).join('');
  
  container.innerHTML = 
    '<div class="wa-mode-select">'+
      '<button class="wa-back-btn" onclick="WordAdventure.init()">← 返回选级</button>'+
      '<h3 style="font-size:18px;font-weight:700;margin:16px 0 8px;color:var(--text-primary)">'+LEVEL_NAMES[state.level].label+'</h3>'+
      '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px">共 '+state.pool.length+' 个词汇 · 选择游戏模式</p>'+
      '<div class="wa-modes">'+modes+'</div>'+
    '</div>';
}

function startMode(mode) {
  state.mode = mode;
  state.idx = 0;
  state.hp = 5;
  state.score = 0;
  state.combo = 0;
  state.playing = true;
  
  if (mode === 'timed') {
    state.timeLeft = 60;
    state.timer = setInterval(function() {
      state.timeLeft--;
      updateTimer();
      if (state.timeLeft <= 0) endGame();
    }, 1000);
  }
  
  showQuestion();
}

function showQuestion() {
  if (state.idx >= state.pool.length) {
    state.pool = state.pool.sort(function() { return Math.random() - 0.5; });
    state.idx = 0;
  }
  
  var word = state.pool[state.idx];
  var container = document.getElementById('p-game');
  
  // Generate 4 options
  var correct = word.meaning;
  var wrongPool = state.pool.filter(function(v) { return v.meaning !== correct; });
  var wrongOptions = [];
  var used = {};
  used[correct] = true;
  
  // Shuffle wrong pool
  wrongPool = wrongPool.sort(function() { return Math.random() - 0.5; });
  
  for (var i = 0; i < wrongPool.length && wrongOptions.length < 3; i++) {
    var m = wrongPool[i].meaning;
    if (!used[m]) {
      wrongOptions.push(m);
      used[m] = true;
    }
  }
  
  // If not enough options, pad with generic
  while (wrongOptions.length < 3) {
    wrongOptions.push('???');
  }
  
  var options = [correct].concat(wrongOptions);
  options = options.sort(function() { return Math.random() - 0.5; });
  
  var optHtml = options.map(function(o, i) {
    return '<button class="wa-opt-btn" data-idx="'+i+'" onclick="WordAdventure.answer(this, '+(o === correct)+')">'+
      '<span class="wa-opt-letter">' + String.fromCharCode(65 + i) + '</span>' +
      '<span class="wa-opt-text">' + escapeHtml(o) + '</span>' +
    '</button>';
  }).join('');
  
  container.innerHTML = 
    '<div class="wa-game">'+
      '<div class="wa-topbar">'+
        '<button class="wa-back-btn" onclick="WordAdventure.endGame()">✕</button>'+
        '<div class="wa-stats">'+
          '<span class="wa-stat hp-bar">' + getHpHtml(state.hp) + '</span>'+
          '<span class="wa-stat">⭐ '+state.score+'</span>'+
          '<span class="wa-stat'+(state.combo>=3?' wa-combo-active':'')+'">🔥 '+state.combo+'</span>'+
        '</div>'+
        (state.mode==='timed' ? '<span class="wa-timer" id="wa-timer">⏱️ '+state.timeLeft+'s</span>' : '')+
      '</div>'+
      '<div class="wa-word-area">'+
        '<div class="wa-word-text">'+escapeHtml(word.word)+'</div>'+
        '<div class="wa-phonetic">'+escapeHtml(word.phonetic||'')+'</div>'+
        '<div class="wa-prompt">选择正确的释义</div>'+
      '</div>'+
      '<div class="wa-options">'+optHtml+'</div>'+
      '<div class="wa-progress">'+
        '<div class="wa-progress-bar" style="width:'+((state.idx+1)/state.pool.length*100)+'%"></div>'+
      '</div>'+
    '</div>';
}

function answer(btn, isCorrect) {
  if (!state.playing) return;
  
  var allBtns = document.querySelectorAll('.wa-opt-btn');
  allBtns.forEach(function(b) { b.disabled = true; b.style.cursor = 'default'; });
  
  if (isCorrect) {
    btn.classList.add('wa-correct');
    state.score += 1 + Math.floor(state.combo / 3);
    state.combo++;
    state.correct++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  } else {
    btn.classList.add('wa-wrong');
    state.hp--;
    state.combo = 0;
    state.wrong++;
    
    // Highlight correct answer
    allBtns.forEach(function(b) {
      if (b.getAttribute('onclick').indexOf(', true)') > 0 || b.getAttribute('onclick').indexOf(',1)') > 0) {
        b.classList.add('wa-show-correct');
      }
    });
    
    if (state.mode === 'match' && state.hp <= 0) {
      setTimeout(function() { endGame(); }, 800);
      return;
    }
  }
  
  state.idx++;
  
  // Update stats
  var hpEl = document.querySelector('.hp-bar');
  if (hpEl) hpEl.innerHTML = getHpHtml(state.hp);
  
  setTimeout(function() {
    if (state.playing) showQuestion();
  }, isCorrect ? 400 : 1200);
}

function endGame() {
  state.playing = false;
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
  
  var container = document.getElementById('p-game');
  var grade = state.score >= 20 ? 'S' : state.score >= 15 ? 'A' : state.score >= 10 ? 'B' : state.score >= 5 ? 'C' : 'D';
  var gradeColors = { S:'#f59e0b', A:'#22c55e', B:'#3b82f6', C:'#8b5cf6', D:'#6b7280' };
  
  container.innerHTML = 
    '<div class="wa-result">'+
      '<div class="wa-result-grade" style="color:'+gradeColors[grade]+'">'+grade+'</div>'+
      '<div class="wa-result-stats">'+
        '<div class="wa-result-stat"><span class="wa-result-num">'+state.score+'</span> 得分</div>'+
        '<div class="wa-result-stat"><span class="wa-result-num">'+state.correct+'/'+(state.correct+state.wrong)+'</span> 正确率</div>'+
        '<div class="wa-result-stat"><span class="wa-result-num">🔥'+state.maxCombo+'</span> 最高连击</div>'+
      '</div>'+
      '<div class="wa-result-actions">'+
        '<button class="wa-result-btn wa-primary" onclick="WordAdventure.startMode(\''+state.mode+'\')">🔄 再来一局</button>'+
        '<button class="wa-result-btn" onclick="WordAdventure.start(\''+state.level+'\')">← 返回模式</button>'+
        '<button class="wa-result-btn" onclick="WordAdventure.init()">← 返回主页</button>'+
      '</div>'+
    '</div>';
}

function updateTimer() {
  var el = document.getElementById('wa-timer');
  if (el) el.textContent = '⏱️ '+state.timeLeft+'s';
}

function getHpHtml(hp) {
  var hearts = '';
  for (var i = 0; i < state.maxHp; i++) {
    hearts += i < hp ? '❤️' : '🤍';
  }
  return hearts;
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;color:#fff;padding:16px 24px;border-radius:12px;z-index:99999;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.3)';
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 2000);
}

// Expose
window.WordAdventure = { init: init, start: start, startMode: startMode, answer: answer, endGame: endGame };
})();
