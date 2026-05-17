/**
 * boxing.js v2 — 第一人称单词拳击（冠军之路）
 * 
 * 第一人称视角，5个对手依次挑战：新人→业余→职业→明星→冠军
 * 答对出拳，答错挨打，方向攻防系统
 */
;(function() {
'use strict';

// ============================================================
// 常量
// ============================================================
const MAX_HP = 5;
const INSTANT_KO_STREAK = 20;  // 连续答对 20 道直接 KO
const TAUNT_CHANCE = 0.22;     // 每回合嘲讽概率
const TAUNT_MIN_INTERVAL = 3;  // 最少间隔 3 回合才出嘲讽

const DIRECTIONS = [
  { id: 'upper', name: '上勾拳', icon: '⬆️' },
  { id: 'left',  name: '左勾拳', icon: '⬅️' },
  { id: 'right', name: '右勾拳', icon: '➡️' },
  { id: 'straight', name: '直拳',   icon: '🎯' },
];

const DIFFICULTY_TABLE = [
  { min: 1,  max: 3,  level: 'N5', time: 7000 },
  { min: 4,  max: 6,  level: 'N4', time: 6000 },
  { min: 7,  max: 10, level: 'N3', time: 5500 },
  { min: 11, max: 15, level: 'N2', time: 4500 },
  { min: 16, max: 99, level: 'N1', time: 3500 },
];

const OPPONENTS = [
  { id: 'rookie',    icon: '😤', name: '新人拳手', color: '#f59e0b',
    hitFace: '😵', koFace: '💀', hp: 5,
    size: 64, glow: 'none',
    bgColor: 'rgba(245,158,11,0.05)' },
  { id: 'amateur',   icon: '😠', name: '业余拳手', color: '#ef4444',
    hitFace: '😫', koFace: '😵', hp: 6,
    size: 70, glow: '0 0 10px rgba(239,68,68,0.3)',
    bgColor: 'rgba(239,68,68,0.05)' },
  { id: 'pro',       icon: '🥊', name: '职业拳手', color: '#8b5cf6',
    hitFace: '😰', koFace: '💫', hp: 7,
    size: 78, glow: '0 0 15px rgba(139,92,246,0.4)',
    bgColor: 'rgba(139,92,246,0.06)' },
  { id: 'star',      icon: '⭐', name: '明星拳手', color: '#ec4899',
    hitFace: '😱', koFace: '🤯', hp: 8,
    size: 82, glow: '0 0 20px rgba(236,72,153,0.5)',
    bgColor: 'rgba(236,72,153,0.07)' },
  { id: 'champion',  icon: '👑', name: '冠军拳手', color: '#fbbf24',
    hitFace: '😱', koFace: '💀', hp: 9,
    size: 90, glow: '0 0 25px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.2)',
    bgColor: 'rgba(251,191,36,0.08)' },
];

// 共享嘲讽池（50 句：35 中文 + 15 日文网络梗）
const TAUNTS_CN = [
  '我大意了没有闪！', '年轻人不讲武德', '耗子尾汁！', '这好吗？这不好！', '接化发！以柔克刚！',
  '我劝你耗子尾汁', '你过来呀！', '你瞅啥？', '小朋友你是否有很多问号', '我读书少你不要骗我',
  '还有这种操作？', '这就很尴尬了', '我太难了', '啊这……不是吧？', '就这就这就这？',
  '真的会谢', '栓Q！（thank you）', '格局小了', '你是在跟我说话吗？', '无敌是多么寂寞',
  '我的内心毫无波动', '人类的本质就是复读机', '你开心就好', '不会吧不会吧不会吧', '厉害了我的哥',
  '请开始你的表演', '我信你个鬼', '这波在大气层', '你不对劲', '弱小可怜又无助',
  '但是——我拒绝！', '你的下一句话是……', '我真是嗨到不行啊！', '我已经记住你了', '做我的对手你还早两万年呢',
];

const TAUNTS_JP = [
  'Gotcha! 🙃', 'LOL', 'Too easy', 'Nice try 😇',
  'Seriously?', 'Is that all you got?', 'Big mistake!', 'Not even close', 'Lagging?',
  'I can read your mind', 'Too weak', 'Whatever', 'Say something!', 'Called it',
];

// 被击败台词（20 句随机）
const DEFEAT_QUOTES = [
  '啊……终于还是败了……', '我大意了没有闪！', '我还会回来的！', '你赢了……但别得意',
  '这次算你狠……', '我不服！下次一定赢你！', '长江后浪推前浪啊……', '你确实有两下子',
  'Well played...', 'I concede... you win', 'Is this the power of hard work...', 'Not done yet...',
  'Got me...', 'Impressive...', 'I won't go down that easily!', 'You've got my attention',
  '好吧……你赢了，我认输', '你的实力我认可了', '这次是我大意了，下次不会了', '打得不错……下次赢回来',
];

// ============================================================
// 状态
// ============================================================
let state = {
  round: 1,
  opponentIndex: 0,          // 当前对手索引 (0~4)
  hp: MAX_HP, maxHp: MAX_HP,
  opponentHp: 5, opponentMaxHp: 5,
  combo: 0, maxCombo: 0,
  score: 0,
  isPlaying: false,
  selectedLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  selectedCategories: [],
  quizMode: 'word',
  currentOpponent: null,
  animating: false,
  winStreak: 0,
  consecutiveCorrect: 0,
  // 统计
  startTime: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  wrongWords: [],
  // 嘲讽
  roundsSinceTaunt: 0,
};

let currentQuestion = null;
let timerId = null;

const el = {};

// ============================================================
// 辅助函数（复用 tower-climb 的逻辑）
// ============================================================
function getDifficulty(round) {
  for (const d of DIFFICULTY_TABLE) {
    if (round >= d.min && round <= d.max) return d;
  }
  return DIFFICULTY_TABLE[DIFFICULTY_TABLE.length - 1];
}

function hasChinese(str) {
  if (!str) return false;
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) return true;
  }
  return false;
}

let _cachedByLevel = {};
let _cachedByLevelCn = {};
let _cachedByCategory = {};

function cacheByLevel() {
  if (Object.keys(_cachedByLevel).length > 0) return;
  if (typeof VOCAB_DATA === 'undefined') return;
  for (const w of VOCAB_DATA) {
    const lv = (w.level || 'N5').toUpperCase().replace(/^N/,'N');
    if (!_cachedByLevel[lv]) _cachedByLevel[lv] = [];
    _cachedByLevel[lv].push(w);
    if (!_cachedByLevelCn[lv]) _cachedByLevelCn[lv] = [];
    if (hasChinese(w.meaning)) _cachedByLevelCn[lv].push(w);
    // 按场景分类缓存
    const cat = w.category || '未分类';
    if (!_cachedByCategory[cat]) _cachedByCategory[cat] = [];
    _cachedByCategory[cat].push(w);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomWords(level, exclude, count = 3) {
  let pool = [];
  const source = state.quizMode === 'word' ? _cachedByLevelCn : _cachedByLevel;
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  if (pool.length < count) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  if (pool.length === 0) pool = _cachedByLevel[level] || _cachedByLevel['N5'];
  
  // 按场景分类过滤
  if (state.selectedCategories && state.selectedCategories.length > 0) {
    pool = pool.filter(function(w) { return state.selectedCategories.indexOf(w.category) >= 0; });
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result = [];
  for (const w of shuffled) {
    if (w.id === exclude) continue;
    if (!result.find(r => r.meaning === w.meaning)) {
      result.push(w);
      if (result.length >= count) break;
    }
  }
  return result;
}

// 发音
let _jpVoice = null;
let _voiceReady = false;

function initVoice() {
  if (_voiceReady || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = function() {
      const v = window.speechSynthesis.getVoices();
      _jpVoice = v.find(vv => vv.lang.startsWith('ja')) || null;
      _voiceReady = true;
    };
    return;
  }
  _jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
  _voiceReady = true;
}

function speak(text, lang = 'ja-JP') {
  try {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.85;
    if (_jpVoice) utter.voice = _jpVoice;
    window.speechSynthesis.speak(utter);
  } catch(e) {}
}

// ============================================================
// 音效
// ============================================================
let _audioCtx = null;
function getCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return _audioCtx;
}

function playTone(freq, duration, type, vol) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

const SFX = {};
SFX.punch = function() {
  playTone(200, 0.08, 'sawtooth', 0.12);
  setTimeout(() => playTone(120, 0.06, 'sawtooth', 0.08), 40);
};
SFX.hit = function() { playTone(400, 0.15, 'square', 0.1); };
SFX.combo = function() { playTone(600, 0.1, 'sine', 0.08); setTimeout(() => playTone(800, 0.15, 'sine', 0.08), 80); };
SFX.wrong = function() { playTone(150, 0.2, 'sawtooth', 0.1); };
SFX.ko = function() {
  playTone(300, 0.1, 'square', 0.1);
  setTimeout(() => playTone(200, 0.15, 'square', 0.08), 100);
  setTimeout(() => playTone(100, 0.3, 'square', 0.06), 200);
};
SFX.bossAppear = function() {
  playTone(400, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(500, 0.1, 'sine', 0.08), 100);
  setTimeout(() => playTone(600, 0.15, 'sine', 0.1), 200);
};

// ============================================================
// 出题
// ============================================================
function generateQuestion() {
  const diff = getDifficulty(state.round);
  const level = diff.level;
  var qType = state.quizType || 'word';
  let pool = [];
  const source = (qType === 'word') ? _cachedByLevelCn : _cachedByLevel;
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  if (pool.length === 0) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  if (pool.length === 0) {
    pool = source[level] || _cachedByLevel['N5'];
  }
  if (!pool || pool.length === 0) return null;

  // 按场景分类过滤
  if (state.selectedCategories && state.selectedCategories.length > 0) {
    pool = pool.filter(function(w) { return state.selectedCategories.indexOf(w.category) >= 0; });
  }

  const word = pool[Math.floor(Math.random() * pool.length)];
  const distractors = getRandomWords(level, word.id, 2); // 拳击只出3选项

  // 选中文的干扰项
  var options;
  // 模拟试题模式：25% 单词释义 + 25% 例句 + 25% 文法 + 25% 单词（混合）
  var actualQType = qType;
  if (actualQType === 'mock') {
    var _r = Math.random();
    if (_r < 0.25) actualQType = 'word';
    else if (_r < 0.5) actualQType = 'sentence';
    else if (_r < 0.75) actualQType = 'grammar';
    else actualQType = 'word';
  }
  
  if (actualQType === 'sentence') {
    // 句子模式：展示句子，选正确的词
    var sentence = word.ex_jp || '';
    if (sentence && sentence.length > 8 && findWordInSentence(word.word, sentence).found) {
      var match = findWordInSentence(word.word, sentence);
      var blanked = sentence.slice(0, match.matchStart) + '＿＿' + sentence.slice(match.matchStart + match.matchText.length);
      options = [
        { text: word.word, correct: true },
        ...distractors.map(function(w) { return { text: w.word, correct: false }; }),
      ];
      shuffle(options);
      speak(sentence);
      return {
        word: word, options: options,
        displayWord: blanked,
        displayReading: word.reading || '',
        displaySentence: sentence,
        displayMeaning: word.meaning || '',
        timeLimit: diff.time,
        level: level,
        type: 'sentence'
      };
    }
    // fallback to word mode
  }
  
  // 文法例句模式
  if (actualQType === 'grammar') {
    var gData2 = (typeof GRAMMAR_DATA !== 'undefined') ? GRAMMAR_DATA : null;
    if (gData2 && gData2.length > 0) {
      var gPool2 = gData2;
      var gLevel2 = level.toLowerCase().replace('n','');
      if (gLevel2) {
        var gFiltered2 = gPool2.filter(function(g) { return (g.level || '').toLowerCase() === gLevel2; });
        if (gFiltered2.length > 0) gPool2 = gFiltered2;
      }
      var gItem2 = gPool2[Math.floor(Math.random() * gPool2.length)];
      if (gItem2 && gItem2.ex_jp) {
        var gSent2 = gItem2.ex_jp;
        var gPat2 = gItem2.pattern || '';
        var gSearch2 = gPat2.replace(/〜/g, '');
        var gIdx2_2 = gSent2.indexOf(gSearch2);
        var gBlankedSent2 = gSent2;
        if (gIdx2_2 >= 0) {
          gBlankedSent2 = gSent2.slice(0, gIdx2_2) + '＿＿' + gSent2.slice(gIdx2_2 + gSearch2.length);
        } else {
          gBlankedSent2 = '＿＿（' + gItem2.desc + '）';
        }
        // 干扰项
        var gWrongPool2 = gData2.filter(function(g) { return g.pattern !== gItem2.pattern; });
        var gShuffled2 = gWrongPool2.sort(function() { return Math.random() - 0.5; });
        var gWrong2 = [];
        for (var gi2 = 0; gi2 < gShuffled2.length && gWrong2.length < 2; gi2++) {
          if (gWrong2.indexOf(gShuffled2[gi2].pattern) === -1) gWrong2.push(gShuffled2[gi2].pattern);
        }
        var gOpts2 = [{ text: gItem2.pattern, correct: true }];
        gWrong2.forEach(function(p) { gOpts2.push({ text: p, correct: false }); });
        shuffle(gOpts2);
        speak(gSent2);
        return {
          word: { word: gItem2.pattern, meaning: gItem2.meaning, reading: '', level: gItem2.level },
          options: gOpts2,
          displayWord: gBlankedSent2,
          displayReading: '',
          displaySentence: gSent2,
          displayMeaning: gItem2.meaning || '',
          timeLimit: diff.time + 2000,
          level: (gItem2.level || '').toUpperCase(),
          type: 'grammar',
        };
      }
    }
    // fallback to word mode
  }
  
  // 单词模式：显示释义
  options = [
    { text: word.meaning || word.word, correct: true },
    ...distractors.map(function(w) { return { text: w.meaning || w.word, correct: false }; }),
  ];
  shuffle(options);

  var gm = JSON.parse(localStorage.getItem('game_settings') || '{}');
  var displayMode = gm.displayMode !== undefined ? gm.displayMode : 0;
  var dw, dr;
  if (displayMode === 0) {
    dw = word.word; dr = word.reading || '';
  } else if (displayMode === 1) {
    dw = word.reading || word.word; dr = word.word;
  } else {
    dw = word.reading || word.word; dr = '';
  }
  
  speak(word.word);

  return {
    word, options,
    displayWord: dw,
    displayReading: dr,
    displaySentence: word.ex_jp || '',
    displayMeaning: word.meaning || '',
    timeLimit: diff.time,
    level,
  };
}

// ============================================================
// 对手选择
// ============================================================
function pickOpponent() {
  const idx = Math.min(state.opponentIndex, OPPONENTS.length - 1);
  const opp = OPPONENTS[idx];
  state.currentOpponent = opp;
  state.opponentHp = opp.hp;
  state.opponentMaxHp = opp.hp;
  state.roundsSinceTaunt = 0;
}

// ============================================================
// 渲染
// ============================================================
function renderRing() {
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const opp = state.currentOpponent || { icon: '😤', name: '???', color: '#888', hitFace: '😵', koFace: '💀' };
  const oppHpPct = state.opponentHp / state.opponentMaxHp * 100;
  const _dmS = JSON.parse(localStorage.getItem('game_settings') || '{}');
  const _dmR = _dmS.displayMode !== undefined ? _dmS.displayMode : 0;
  const _wordColor = ['#e2e8f0', '#fbbf24', '#4ade80'][_dmR];
  const _wordShadow = ['0 0 20px rgba(168,85,247,0.2)', '0 0 20px rgba(251,191,36,0.2)', '0 0 20px rgba(52,211,153,0.2)'][_dmR];
  
  container.innerHTML = `
    <style>
      @keyframes bxPunch {
        0% { transform:translate(0,0) rotate(0deg); }
        20% { transform:translate(30px,-20px) rotate(-15deg) scale(1.3); }
        40% { transform:translate(60px,-10px) rotate(-5deg) scale(1.1); }
        60% { transform:translate(30px,-20px) rotate(-15deg) scale(1.2); }
        100% { transform:translate(0,0) rotate(0deg); }
      }
      @keyframes bxHitShake {
        0%,100% { transform:translateX(0) rotate(0deg); }
        15% { transform:translateX(-20px) rotate(-8deg); }
        30% { transform:translateX(15px) rotate(5deg); }
        45% { transform:translateX(-10px) rotate(-3deg); }
        60% { transform:translateX(8px) rotate(2deg); }
      }
      @keyframes bxOpponentPunch {
        0% { transform:translate(0,0); }
        30% { transform:translate(-40px,10px); }
        60% { transform:translate(-30px,5px); }
        100% { transform:translate(0,0); }
      }
      @keyframes bxScreenShake {
        0%,100% { transform:translate(0,0); }
        20% { transform:translate(-6px,3px); }
        40% { transform:translate(6px,-3px); }
        60% { transform:translate(-4px,2px); }
        80% { transform:translate(4px,-2px); }
      }
      @keyframes bxFloatUp {
        0% { opacity:1; transform:translateY(0) scale(1); }
        100% { opacity:0; transform:translateY(-50px) scale(1.5); }
      }
      @keyframes bxBounceIn {
        0% { transform:scale(0.3); opacity:0; }
        50% { transform:scale(1.15); }
        70% { transform:scale(0.9); }
        100% { transform:scale(1); opacity:1; }
      }
      @keyframes bxPulse {
        0%,100% { opacity:1; transform:scale(1); }
        50% { opacity:0.7; transform:scale(1.05); }
      }
      @keyframes bxSpeechIn {
        0% { opacity:0; transform:translate(-50%,10px) scale(0.8); }
        50% { opacity:1; transform:translate(-50%,0) scale(1.05); }
        100% { opacity:1; transform:translate(-50%,0) scale(1); }
      }
      @keyframes bxCrownGlow {
        0%,100% { filter:drop-shadow(0 0 8px #fbbf24); }
        50% { filter:drop-shadow(0 0 20px #fbbf24) drop-shadow(0 0 40px #f59e0b); }
      }
      .bx-ring {
        display:flex; flex-direction:column; height:100%;
        background:radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0a0a18 100%);
        position:relative; overflow:hidden;
      }
      /* 聚光灯效果 */
      .bx-ring::before {
        content:''; position:absolute; top:0; left:50%; transform:translateX(-50%);
        width:200px; height:300px;
        background:radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%);
        pointer-events:none;
      }
      /* 擂台地板线 */
      .bx-ring::after {
        content:''; position:absolute; bottom:80px; left:5%; right:5%;
        height:3px;
        background:linear-gradient(90deg, transparent, rgba(255,215,0,0.1) 20%, rgba(255,215,0,0.15) 50%, rgba(255,215,0,0.1) 80%, transparent);
        border-radius:2px;
      }
    </style>
    <div class="bx-ring" id="bx-ring">
      <!-- HUD -->
      <div style="display:flex;justify-content:space-between;padding:8px 14px;flex-shrink:0;z-index:10">
        <div>
          <div style="font-size:11px;color:#94a3b8;font-weight:600">ROUND ${state.round}</div>
          <div style="font-size:11px;color:#64748b;font-weight:600">${({word:'📖单词',sentence:'💬例句',grammar:'📐文法',mock:'📋模拟'})[_dmS.quizType||'word'] || '📖单词'}</div>
          <div style="font-size:17px;letter-spacing:1px" id="bx-hp">
            ${'❤️'.repeat(state.hp)}${'🖤'.repeat(state.maxHp - state.hp)}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#94a3b8;font-weight:600">SCORE</div>
          <div style="font-size:17px;color:#fbbf24;font-weight:700" id="bx-score">${state.score}</div>
        </div>
      </div>
      
      <!-- 对手区 -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;min-height:0">
        <!-- 对手血量 -->
        <div style="width:160px;height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;margin-bottom:6px">
          <div style="height:100%;width:${oppHpPct}%;background:linear-gradient(90deg,#22c55e,#ef4444);border-radius:4px;transition:width 0.3s ease-out" id="bx-opp-hp-bar"></div>
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:6px" id="bx-opp-name">${opp.icon} ${opp.name}</div>
        
        <!-- 对手表情（尺寸和光效随对手变化） -->
        <div id="bx-opp-face" style="font-size:${opp.size || 72}px;margin-bottom:2px;transition:all 0.15s;user-select:none;line-height:1;filter:drop-shadow(${opp.glow || 'none'});animation:${state.opponentIndex >= 4 ? 'bxCrownGlow 2s ease-in-out infinite' : 'none'}">
          ${opp.icon}
        </div>
        <div style="font-size:10px;color:#64748b">👊 ${state.opponentHp}/${state.opponentMaxHp}</div>
        
        <!-- 嘲讽气泡 -->
        <div id="bx-taunt" style="position:absolute;top:5%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.88);color:#fff;padding:10px 20px;border-radius:14px;font-size:19px;font-weight:700;max-width:300px;text-align:center;pointer-events:none;opacity:0;z-index:15;border:1px solid rgba(255,255,255,0.12);box-shadow:0 6px 28px rgba(0,0,0,0.6);line-height:1.4">
        </div>
        
        <!-- 浮字区 -->
        <div id="bx-float" style="position:absolute;top:35%;left:50%;transform:translateX(-50%);font-size:36px;font-weight:900;pointer-events:none;z-index:5;text-shadow:0 0 40px rgba(255,255,255,0.3)"></div>
        
        <!-- 方向显示 -->
        <div id="bx-dir-display" style="position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:800;text-shadow:0 2px 12px rgba(0,0,0,0.8);z-index:20;pointer-events:none;white-space:nowrap;text-align:center"></div>
      </div>
      
      <!-- 问题区 -->
      <div style="flex-shrink:0;text-align:center;padding:0 16px 10px">
        <div style="font-size:28px;font-weight:700;color:${_wordColor};letter-spacing:2px;margin-bottom:10px;text-shadow:${_wordShadow}" id="bx-word">
          ${currentQuestion ? currentQuestion.displayWord : '🥊 准备战斗'}
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:8px;${_dmR === 2 ? 'display:none' : ''}" id="bx-level">
          ${currentQuestion ? currentQuestion.level + ' · ' + currentQuestion.displayReading : ''}
        </div>
        
        <!-- 选项（拳击目标） -->
        <div style="display:flex;gap:8px;justify-content:center" id="bx-options">
        </div>
        
        <!-- 连击 -->
        <div style="margin-top:6px;font-size:11px;color:#94a3b8;transition:all 0.2s" id="bx-combo">
          ${state.combo > 0 ? `🔥 ${state.combo} 连击` : ''}
        </div>
      </div>
      
      <!-- 拳击手套（第一人称视角底部） -->
      <div style="flex-shrink:0;height:60px;display:flex;justify-content:center;align-items:center;position:relative;z-index:2;overflow:hidden">
        <div id="bx-glove-left" style="font-size:34px;transform:rotate(10deg);margin-right:-8px;transition:transform 0.1s">🥊</div>
        <div id="bx-glove-right" style="font-size:38px;transform:rotate(-10deg);margin-left:-8px;transition:transform 0.1s">🥊</div>
      </div>
      
      <!-- 计时器 -->
      <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);z-index:10">
        <div id="bx-timer" style="font-size:11px;color:#64748b;font-weight:600;font-variant-numeric:tabular-nums">--</div>
      </div>
    </div>
  `;
  
  // 绑定选项
  if (currentQuestion) {
    renderOptions();
  }
}

function renderOptions() {
  const container = document.getElementById('bx-options');
  if (!container || !currentQuestion) return;
  
  container.innerHTML = currentQuestion.options.map((opt, i) => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e'];
    const positions = ['rotate(-5deg)', 'rotate(0deg)', 'rotate(5deg)'];
    return `<div class="bx-opt" data-index="${i}" style="
      flex:1; max-width:140px; padding:14px 6px; border-radius:16px;
      background:linear-gradient(135deg, ${colors[i]}22, ${colors[i]}11);
      border:2px solid ${colors[i]}44;
      color:#eaeaea; font-size:14px; font-weight:600; text-align:center;
      cursor:pointer; transition:all 0.15s; user-select:none;
      ${positions[i]};
      animation:bxBounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both;
    ">${opt.text}</div>`;
  }).join('');
  
  container.querySelectorAll('.bx-opt').forEach(el => {
    el.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      handleAnswer(idx);
    });
    el.addEventListener('mouseenter', function() {
      if (!state.animating) {
        this.style.transform = 'scale(1.08) translateY(-4px)';
        this.style.borderColor = this.style.borderColor.replace('44', 'aa');
        this.style.boxShadow = '0 4px 20px rgba(255,255,255,0.1)';
      }
    });
    el.addEventListener('mouseleave', function() {
      if (!state.animating) {
        this.style.transform = '';
        this.style.boxShadow = '';
      }
    });
  });
}

// ============================================================
// 游戏逻辑
// ============================================================
function handleAnswer(index) {
  if (state.animating || !currentQuestion) return;
  state.animating = true;
  
  const opt = currentQuestion.options[index];
  const isCorrect = opt && opt.correct;
  
  if (isCorrect) {
    onCorrect(index);
  } else {
    onWrong(index);
  }
}

function onCorrect(index) {
  state.totalAnswered++;
  state.totalCorrect++;
  state.combo++;
  state.consecutiveCorrect++;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  state.score += 10 * state.combo;
  tryTaunt();
  
  // 方向系统：我方随机出拳 vs 对方随机防3方向
  const punchIdx = Math.floor(Math.random() * 4);
  const punch = DIRECTIONS[punchIdx];
  // 对方随机选1个方向不防（即防3个方向）
  const unguardedIdx = Math.floor(Math.random() * 4);
  const isBlocked = punchIdx !== unguardedIdx;
  
  SFX.punch();
  
  // 拳击手套动画
  const glove = document.getElementById('bx-glove-right');
  if (glove) {
    glove.style.animation = 'bxPunch 0.35s ease-out';
    setTimeout(() => { if (glove) glove.style.animation = ''; }, 400);
  }
  
  // 显示出拳方向
  const dirEl = document.getElementById('bx-dir-display');
  if (dirEl) {
    dirEl.textContent = isBlocked ? '🛡️ 被格挡！' : (punch.icon + ' ' + punch.name + '！');
    dirEl.style.color = isBlocked ? '#94a3b8' : '#fbbf24';
    dirEl.style.animation = 'none';
    void dirEl.offsetHeight;
    dirEl.style.animation = 'bxFloatUp 0.8s ease-out forwards';
    setTimeout(() => { if (dirEl) dirEl.textContent = ''; }, 900);
  }
  
  // 被格挡 → 无伤害
  if (isBlocked) {
    showFloat('🛡️', '#94a3b8');
    updateHUD();
    setTimeout(() => {
      state.animating = false;
      if (state.isPlaying) nextRound();
    }, 400);
    return;
  }
  
  // 打中了！
  // 检查 20 连胜 KO
  if (state.consecutiveCorrect >= INSTANT_KO_STREAK) {
    state.opponentHp = 1; // 下一击 KO
    showFloat('🔥🔥 20连胜！必杀一击！🔥🔥', '#ff6b6b');
    SFX.ko();
  }
  
  // 对手受击
  const oppFace = document.getElementById('bx-opp-face');
  const opp = state.currentOpponent;
  if (oppFace && opp) {
    oppFace.style.animation = 'bxHitShake 0.4s ease-out';
    oppFace.textContent = opp.hitFace || '😵';
    setTimeout(() => {
      if (oppFace) {
        oppFace.style.animation = '';
        oppFace.textContent = opp.icon;
      }
    }, 500);
  }
  
  // 屏幕震动
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.2s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 200);
  
  // 连击反馈
  if (state.combo >= 3) {
    SFX.combo();
    showFloat('🔥 ' + state.combo + '连击！', '#fbbf24');
  }
  
  // 对手扣血
  state.opponentHp--;
  const hpBar = document.getElementById('bx-opp-hp-bar');
  if (hpBar) {
    const pct = state.opponentHp / state.opponentMaxHp * 100;
    hpBar.style.width = pct + '%';
  }
  
  // 判断是否 KO
  if (state.opponentHp <= 0) {
    SFX.ko();
    if (oppFace && opp) oppFace.textContent = opp.koFace || '💀';
    showDefeatQuote(); // 被击败台词
    state.winStreak++;
    state.round++;
    state.consecutiveCorrect = 0; // KO 后重置连胜计数
    
    const bonus = 50 + state.opponentIndex * 30; // 越往后奖励越高
    showFloat('💥 KO！+' + bonus, '#22c55e');
    state.score += bonus;
    
    state.combo = 0;
    
    // 已击败冠军 → 胜利
    if (state.opponentIndex >= OPPONENTS.length - 1) {
      setTimeout(() => {
        state.animating = false;
        victoryScreen();
      }, 1500);
      updateHUD();
      return;
    }
    
    // 切换到下一对手
    state.opponentIndex++;
    
    setTimeout(() => {
      state.animating = false;
      nextOpponent();
    }, 1500);
    updateHUD();
    return;
  }
  
  // 打中但未 KO
  showFloat('💥 +' + (10 * state.combo), '#22c55e');
  updateHUD();
  
  setTimeout(() => {
    state.animating = false;
    if (state.isPlaying) nextRound();
  }, 500);
}

function onWrong(index) {
  state.totalAnswered++;
  state.combo = 0;
  state.consecutiveCorrect = 0;
  if (currentQuestion && currentQuestion.word) {
    state.wrongWords.push(currentQuestion.word);
  }
  tryTaunt();
  
  // 方向系统：对方随机攻1方向 vs 我方随机防1方向
  const attackIdx = Math.floor(Math.random() * 4);
  const attack = DIRECTIONS[attackIdx];
  const guardIdx = Math.floor(Math.random() * 4);
  const isGuarded = attackIdx === guardIdx;
  
  // 方向显示
  const dirEl = document.getElementById('bx-dir-display');
  if (dirEl) {
    dirEl.textContent = isGuarded ? ('🛡️ 防御成功！挡住 ' + attack.icon) : (attack.icon + ' 对方' + attack.name + '！');
    dirEl.style.color = isGuarded ? '#4ecca3' : '#ef4444';
    dirEl.style.animation = 'none';
    void dirEl.offsetHeight;
    dirEl.style.animation = 'bxFloatUp 0.8s ease-out forwards';
    setTimeout(() => { if (dirEl) dirEl.textContent = ''; }, 900);
  }
  
  // 防御成功 → 无伤害
  if (isGuarded) {
    SFX.hit();
    showFloat('🛡️ 防御！', '#4ecca3');
    updateHUD();
    setTimeout(() => {
      state.animating = false;
      if (state.isPlaying) nextRound();
    }, 400);
    return;
  }
  
  SFX.wrong();
  state.hp--;
  
  // 屏幕震动更剧烈
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.4s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 400);
  
  // 对手挥拳动画
  const oppFace = document.getElementById('bx-opp-face');
  if (oppFace) oppFace.style.animation = 'bxOpponentPunch 0.3s ease-out';
  setTimeout(() => { if (oppFace) oppFace.style.animation = ''; }, 300);
  
  // 我方手套后仰
  const glove = document.getElementById('bx-glove-left');
  if (glove) {
    glove.style.transform = 'rotate(30deg) translateX(-10px)';
    setTimeout(() => { if (glove) glove.style.transform = 'rotate(10deg)'; }, 300);
  }
  
  showFloat('😵 被击中！', '#ef4444');
  
  if (state.hp <= 0) {
    setTimeout(() => {
      state.animating = false;
      gameOver();
    }, 800);
    updateHUD();
    return;
  }
  
  updateHUD();
  setTimeout(() => {
    state.animating = false;
    if (state.isPlaying) nextRound();
  }, 600);
}

function showFloat(text, color) {
  const el = document.getElementById('bx-float');
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'bxFloatUp 0.8s ease-out forwards';
}

// ============================================================
// 嘲讽系统
// ============================================================
function showTaunt() {
  // 随机选中文或日文（35:15 概率 ≈ 70% 中文）
  const useJP = Math.random() < 0.3;
  const pool = useJP ? TAUNTS_JP : TAUNTS_CN;
  const text = pool[Math.floor(Math.random() * pool.length)];
  
  const el = document.getElementById('bx-taunt');
  if (!el) return;
  el.textContent = '💬 ' + text;
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'bxSpeechIn 0.3s ease-out forwards';
  el.style.opacity = '1';
  
  // 2.5 秒后消失
  setTimeout(() => {
    if (el) {
      el.style.opacity = '0';
      el.style.animation = 'none';
    }
  }, 2500);
}

function tryTaunt() {
  state.roundsSinceTaunt++;
  if (state.roundsSinceTaunt < TAUNT_MIN_INTERVAL) return;
  if (Math.random() < TAUNT_CHANCE) {
    showTaunt();
    state.roundsSinceTaunt = 0;
  }
}

// ============================================================
// 被击败台词
// ============================================================
function showDefeatQuote() {
  const text = DEFEAT_QUOTES[Math.floor(Math.random() * DEFEAT_QUOTES.length)];
  
  const el = document.getElementById('bx-taunt');
  if (!el) return;
  el.textContent = '😵 "' + text + '"';
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'bxSpeechIn 0.4s ease-out forwards';
  el.style.opacity = '1';
}

// ============================================================
// 游戏流程
// ============================================================
function nextOpponent() {
  pickOpponent();
  renderRing();
  updateHUD();
  nextRound();
}

function nextRound() {
  if (!state.isPlaying) return;
  // 不设置 animating = true，让 handleAnswer / onTimeout 管理动画锁
  currentQuestion = generateQuestion();
  
  const wordEl = document.getElementById('bx-word');
  const levelEl = document.getElementById('bx-level');
  if (wordEl) {
    const _gm2 = JSON.parse(localStorage.getItem('game_settings') || '{}');
    const _dm2 = _gm2.displayMode !== undefined ? _gm2.displayMode : 0;
    wordEl.textContent = currentQuestion ? currentQuestion.displayWord : '---';
    wordEl.style.color = ['#e2e8f0', '#fbbf24', '#4ade80'][_dm2];
    wordEl.style.textShadow = ['0 0 20px rgba(168,85,247,0.2)', '0 0 20px rgba(251,191,36,0.2)', '0 0 20px rgba(52,211,153,0.2)'][_dm2];
  }
  if (levelEl) {
    const _gm3 = JSON.parse(localStorage.getItem('game_settings') || '{}');
    const _dm3 = _gm3.displayMode !== undefined ? _gm3.displayMode : 0;
    levelEl.textContent = currentQuestion
      ? currentQuestion.level + ' · ' + currentQuestion.displayReading
      : '';
    levelEl.style.display = (_dm3 === 2 && (!currentQuestion || !currentQuestion.displayReading)) ? 'none' : '';
  }
  
  renderOptions();
  updateHUD();
  startTimer();
}

function updateHUD() {
  const hpEl = document.getElementById('bx-hp');
  if (hpEl) hpEl.innerHTML = '❤️'.repeat(state.hp) + '🖤'.repeat(state.maxHp - state.hp);
  
  const scoreEl = document.getElementById('bx-score');
  if (scoreEl) scoreEl.textContent = state.score;
  
  const comboEl = document.getElementById('bx-combo');
  if (comboEl) comboEl.textContent = state.combo >= 2 ? `🔥 ${state.combo} 连击` : '';
  
  const oppHpEl = document.getElementById('bx-opp-hp-bar');
  if (oppHpEl) {
    const pct = state.opponentHp / state.opponentMaxHp * 100;
    oppHpEl.style.width = pct + '%';
  }
  
  const oppNameEl = document.getElementById('bx-opp-name');
  if (oppNameEl && state.currentOpponent) {
    oppNameEl.textContent = `${state.currentOpponent.icon} ${state.currentOpponent.name}`;
  }
  
  const faceEl = document.getElementById('bx-opp-face');
  if (faceEl && state.currentOpponent) {
    faceEl.textContent = state.currentOpponent.icon;
  }
}

function startTimer() {
  const timerEl = document.getElementById('bx-timer');
  if (!timerEl || !currentQuestion) return;
  
  const timeLimit = currentQuestion.timeLimit || 7000;
  const startTime = Date.now();
  
  if (timerId) clearInterval(timerId);
  
  timerId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);
    const secs = (remaining / 1000).toFixed(1);
    timerEl.textContent = secs + 's';
    
    if (remaining < 2000) {
      timerEl.style.color = '#ef4444';
      timerEl.style.animation = 'bxPulse 0.5s ease-in-out infinite';
    } else if (remaining < 4000) {
      timerEl.style.color = '#fbbf24';
      timerEl.style.animation = '';
    } else {
      timerEl.style.color = '#64748b';
      timerEl.style.animation = '';
    }
    
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      onTimeout();
    }
  }, 100);
}

function onTimeout() {
  if (state.animating) return;
  state.animating = true;
  state.totalAnswered++;
  if (currentQuestion && currentQuestion.word) {
    state.wrongWords.push(currentQuestion.word);
  }
  state.consecutiveCorrect = 0;
  SFX.wrong();
  
  state.combo = 0;
  state.hp--;
  
  const ring = document.getElementById('bx-ring');
  if (ring) ring.style.animation = 'bxScreenShake 0.4s ease-out';
  setTimeout(() => { if (ring) ring.style.animation = ''; }, 400);
  
  const oppFace = document.getElementById('bx-opp-face');
  if (oppFace) oppFace.style.animation = 'bxOpponentPunch 0.3s ease-out';
  setTimeout(() => { if (oppFace) oppFace.style.animation = ''; }, 300);
  
  showFloat('⏰ 超时！', '#ef4444');
  
  if (state.hp <= 0) {
    updateHUD();
    setTimeout(() => { state.animating = false; gameOver(); }, 800);
  } else {
    updateHUD();
    setTimeout(() => { state.animating = false; if (state.isPlaying) nextRound(); }, 600);
  }
}

// ============================================================
// 胜利画面
// ============================================================
function victoryScreen() {
  state.isPlaying = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
  
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const accuracy = state.totalAnswered > 0
    ? Math.round(state.totalCorrect / state.totalAnswered * 100)
    : 0;
  
  // 错词去重 → 加入生词本
  const uniqueWrong = [];
  const seenIds = new Set();
  for (const w of state.wrongWords) {
    if (w && w.id && !seenIds.has(w.id)) {
      seenIds.add(w.id);
      uniqueWrong.push(w);
    }
  }
  let bookAddCount = 0;
  try {
    var bookKey = 'jp_book';
    var book = JSON.parse(localStorage.getItem(bookKey) || '[]');
    var idSet = new Set();
    for (var bi = 0; bi < book.length; bi++) {
      if (book[bi].type === 'vocab' && book[bi].id) idSet.add(book[bi].id);
      else if (book[bi].type === 'ai' && book[bi].word) idSet.add('ai:' + book[bi].word);
    }
    for (var wi = 0; wi < uniqueWrong.length; wi++) {
      var w = uniqueWrong[wi];
      if (w && w.id && !idSet.has(w.id)) {
        book.unshift({type:'vocab', id: w.id});
        idSet.add(w.id);
        bookAddCount++;
      }
    }
    if (bookAddCount > 0) {
      localStorage.setItem(bookKey, JSON.stringify(book));
    }
  } catch(e) { /* 静默失败 */ }
  
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const isHighScore = state.score > (parseInt(localStorage.getItem('bx_high_score') || '0'));
  if (isHighScore) localStorage.setItem('bx_high_score', state.score);
  
  container.innerHTML = `
    <style>
      @keyframes bxChampionPulse {
        0% { transform:scale(1); text-shadow:0 0 20px #fbbf24; }
        50% { transform:scale(1.05); text-shadow:0 0 40px #fbbf24,0 0 80px #f59e0b; }
        100% { transform:scale(1); text-shadow:0 0 20px #fbbf24; }
      }
      @keyframes bxChampionBg {
        0% { background-position:0% 50%; }
        50% { background-position:100% 50%; }
        100% { background-position:0% 50%; }
      }
      @keyframes bxStars {
        0% { transform:translateY(0) rotate(0deg); opacity:0; }
        50% { opacity:1; }
        100% { transform:translateY(-60px) rotate(360deg); opacity:0; }
      }
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:20px 30px;text-align:center;background:linear-gradient(-45deg,#1a1a2e,#16213e,#0f3460,#1a1a2e);background-size:400% 400%;animation:bxChampionBg 4s ease infinite;position:relative;overflow:hidden">
      
      <!-- 五彩纸屑 -->
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden">
        ${'⭐🌟✨💫'.split('').map((s,i) => 
          '<div style="position:absolute;top:' + (Math.random()*30+5) + '%;left:' + (Math.random()*80+10) + '%;font-size:' + (16+Math.random()*20) + 'px;animation:bxStars ' + (1.5+Math.random()*2) + 's ease-out ' + (Math.random()*0.5) + 's forwards">' + s + '</div>'
        ).join('')}
      </div>
      
      <div style="font-size:48px;margin-bottom:8px;animation:bxChampionPulse 1.5s ease-in-out infinite">👑</div>
      <div style="font-size:28px;font-weight:900;background:linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px;letter-spacing:2px">恭喜获得冠军！</div>
      <div style="font-size:13px;color:#94a3b8;margin-bottom:20px">你击败了所有对手，站上了顶峰！</div>
      
      <!-- 战绩面板 -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:16px 24px;width:260px;margin-bottom:20px">
        <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:10px;letter-spacing:1px">📊 战后统计</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="text-align:left;font-size:12px;color:#94a3b8">⏱ 用时</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#e2e8f0">${mins}分${secs.toString().padStart(2,'0')}秒</div>
          <div style="text-align:left;font-size:12px;color:#94a3b8">📝 单词量</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#e2e8f0">${state.totalAnswered} 题</div>
          <div style="text-align:left;font-size:12px;color:#94a3b8">✅ 正确率</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#${accuracy >= 80 ? '22c55e' : accuracy >= 60 ? 'fbbf24' : 'ef4444'}">${accuracy}%</div>
          <div style="text-align:left;font-size:12px;color:#94a3b8">💯 得分</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#fbbf24">${state.score}</div>
          <div style="text-align:left;font-size:12px;color:#94a3b8">🔥 最高连击</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#ec4899">${state.maxCombo}</div>
          <div style="text-align:left;font-size:12px;color:#94a3b8">🥊 击败对手</div>
          <div style="text-align:right;font-size:14px;font-weight:700;color:#22c55e">${OPPONENTS.length}</div>
        </div>
      </div>
      
      ${isHighScore ? '<div style="font-size:14px;color:#fbbf24;font-weight:700;margin-bottom:12px">🏆 新纪录！</div>' : ''}
      
      ${uniqueWrong.length > 0 ? `
        <div style="width:260px;margin-bottom:10px;background:rgba(239,68,68,0.06);border-radius:10px;padding:8px 10px;border:1px solid rgba(239,68,68,0.12)">
          <div style="font-size:11px;color:#f87171;font-weight:600;margin-bottom:4px">📝 错词 (${state.wrongWords.length}) · 已加入生词本 ✅</div>
          <div style="max-height:50px;overflow-y:auto;font-size:10px;color:#fca5a5;line-height:1.8">
            ${uniqueWrong.slice(0,25).map(w => '<span style="display:inline-block;margin:0 3px;padding:0 6px;background:rgba(239,68,68,0.08);border-radius:4px">' + w.word + '</span>').join('')}
            ${uniqueWrong.length > 25 ? '<span style="color:#64748b;font-size:9px"> +' + (uniqueWrong.length - 25) + ' 更多</span>' : ''}
          </div>
        </div>
      ` : ''}
      
      <div style="display:flex;gap:10px">
        <button onclick="GameBoxing.start()" style="padding:14px 32px;border-radius:24px;border:none;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1a1a2e;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 24px rgba(251,191,36,0.3);transition:all 0.2s">🔄 再来一局</button>
        <button onclick="window.GameBoxing.backToMenu()" style="padding:14px 20px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#94a3b8;font-size:13px;cursor:pointer;transition:all 0.2s">🔙 返回</button>
      </div>
    </div>
  `;
}

// ============================================================
// 游戏结束
// ============================================================
function gameOver() {
  state.isPlaying = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
  
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const isHighScore = state.score > (parseInt(localStorage.getItem('bx_high_score') || '0'));
  if (isHighScore) localStorage.setItem('bx_high_score', state.score);
  
  // 错词去重 → 加入生词本
  const uniqueWrong = [];
  const seenIds = new Set();
  for (const w of state.wrongWords) {
    if (w && w.id && !seenIds.has(w.id)) {
      seenIds.add(w.id);
      uniqueWrong.push(w);
    }
  }
  let bookAddCount = 0;
  try {
    var bookKey = 'jp_book';
    var book = JSON.parse(localStorage.getItem(bookKey) || '[]');
    var idSet = new Set();
    for (var bi = 0; bi < book.length; bi++) {
      if (book[bi].type === 'vocab' && book[bi].id) idSet.add(book[bi].id);
      else if (book[bi].type === 'ai' && book[bi].word) idSet.add('ai:' + book[bi].word);
    }
    for (var wi = 0; wi < uniqueWrong.length; wi++) {
      var w = uniqueWrong[wi];
      if (w && w.id && !idSet.has(w.id)) {
        book.unshift({type:'vocab', id: w.id});
        idSet.add(w.id);
        bookAddCount++;
      }
    }
    if (bookAddCount > 0) {
      localStorage.setItem(bookKey, JSON.stringify(book));
    }
  } catch(e) { /* 静默失败 */ }
  
  container.innerHTML = `
    <style>
      @keyframes bxGameOver {
        0% { transform:scale(0.5); opacity:0; }
        60% { transform:scale(1.1); }
        100% { transform:scale(1); opacity:1; }
      }
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:30px;text-align:center">
      <div style="font-size:60px;margin-bottom:10px;animation:bxGameOver 0.6s cubic-bezier(0.34,1.56,0.64,1) both">😵</div>
      <div style="font-size:22px;font-weight:800;color:#ef4444;margin-bottom:4px">被 ${state.currentOpponent ? state.currentOpponent.name : '???'} 击倒了！</div>
      ${state.opponentIndex < OPPONENTS.length - 1 ? '<div style="font-size:13px;color:#94a3b8;margin-bottom:16px">坚持了 ' + state.round + ' 回合 · ' + state.score + ' 分</div>' : ''}
      <div style="font-size:13px;color:#94a3b8;margin-bottom:16px">✅ 正确率 ${state.totalAnswered > 0 ? Math.round(state.totalCorrect / state.totalAnswered * 100) : 0}% · ⏱ ${Math.floor((Date.now() - state.startTime) / 1000)}s</div>
      ${isHighScore ? '<div style="font-size:14px;color:#fbbf24;font-weight:700;margin-bottom:10px">🏆 新纪录！</div>' : ''}
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">
        🔥 最高连击 ${state.maxCombo} · 📝 ${state.totalAnswered} 题
      </div>
      ${uniqueWrong.length > 0 ? `
        <div style="width:100%;max-width:280px;margin-bottom:10px;background:rgba(239,68,68,0.06);border-radius:10px;padding:8px 10px;border:1px solid rgba(239,68,68,0.12)">
          <div style="font-size:11px;color:#f87171;font-weight:600;margin-bottom:4px">📝 错词 (${state.wrongWords.length}) · 已加入生词本 ✅</div>
          <div style="max-height:50px;overflow-y:auto;font-size:10px;color:#fca5a5;line-height:1.8">
            ${uniqueWrong.slice(0,25).map(w => '<span style="display:inline-block;margin:0 3px;padding:0 6px;background:rgba(239,68,68,0.08);border-radius:4px">' + w.word + '</span>').join('')}
            ${uniqueWrong.length > 25 ? '<span style="color:#64748b;font-size:9px"> +' + (uniqueWrong.length - 25) + ' 更多</span>' : ''}
          </div>
        </div>
      ` : `
        <div style="margin:6px 0 12px;font-size:11px;color:#22c55e">🎉 没有错词！太棒了！</div>
      `}
      <div style="display:flex;gap:10px">
        <button onclick="GameBoxing.start()" style="padding:12px 28px;border-radius:24px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 24px rgba(239,68,68,0.3);transition:all 0.2s">🔄 再来一局</button>
        <button onclick="window.GameBoxing.backToMenu()" style="padding:12px 20px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#94a3b8;font-size:13px;cursor:pointer;transition:all 0.2s">🔙 返回</button>
      </div>
    </div>
  `;
}

// ============================================================
// 启动 / 菜单
// ============================================================
function start() {
  // 🥊 拳击横幅
  (function(){try{
    var b=document.createElement('div');
    b.id='gmBanner';
    b.innerHTML='<span style="font-size:32px;margin-right:10px">🥊</span><span style="font-weight:800;font-size:18px">先拿个冠军看看</span>';
    b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:8px;height:64px;background:linear-gradient(135deg,rgba(239,68,68,0.95),rgba(251,191,36,0.95));color:#fff;backdrop-filter:blur(8px);transform:translateY(-100%);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    document.body.appendChild(b);
    requestAnimationFrame(function(){b.style.transform='translateY(0)'});
    setTimeout(function(){b.style.transform='translateY(-100%)';setTimeout(function(){b.remove()},600)},3000);
  }catch(e){}})();
  cacheByLevel();
  // 从 localStorage 读取单词范围设置
  var gm = JSON.parse(localStorage.getItem('game_settings') || '{}');
  state.selectedLevels = gm.lvlOn !== false && gm.selLvls && gm.selLvls.length
    ? gm.selLvls.map(function(l){return l.toUpperCase().replace(/^N/,'N')})
    : ['N5','N4','N3','N2','N1'];
  state.selectedCategories = gm.catOn && gm.selCats && gm.selCats.length ? gm.selCats : [];
  state.quizType = gm.quizType || 'word';
  
  state.round = 1;
  state.opponentIndex = 0;
  state.hp = MAX_HP;
  state.maxHp = MAX_HP;
  state.combo = 0;
  state.maxCombo = 0;
  state.score = 0;
  state.isPlaying = true;
  state.winStreak = 0;
  state.animating = false;
  state.consecutiveCorrect = 0;
  state.startTime = Date.now();
  state.totalAnswered = 0;
  state.totalCorrect = 0;
  state.wrongWords = [];
  
  pickOpponent();
  renderRing();
  updateHUD();
  nextRound();
}

function init() {
  cacheByLevel();
  initVoice();
  
  const container = document.getElementById('p-game');
  if (!container) return;
  
  container.innerHTML = `
    <style>
      @keyframes bxEntrance {
        0% { transform:translateY(20px); opacity:0; }
        100% { transform:translateY(0); opacity:1; }
      }
    </style>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:30px;text-align:center;background:radial-gradient(ellipse at 50% 30%, #1a1a2e, #0a0a18)">
      <div style="font-size:48px;margin-bottom:10px;animation:bxBounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both">🥊</div>
      <div style="font-size:20px;font-weight:800;color:#e2e8f0;margin-bottom:4px;background:linear-gradient(135deg,#ef4444,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent">单词拳击</div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:16px;line-height:1.8">
        第一人称 · 出拳打中正确答案<br>
        <span style="color:#22c55e">✅ 答对出拳</span> · <span style="color:#ef4444">❌ 答错挨打</span><br>
        <span style="color:#64748b">🔥 连击越多伤害越高</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;width:200px">
        <button onclick="GameBoxing.start()" style="padding:14px 24px;border-radius:24px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 24px rgba(239,68,68,0.3);transition:all 0.2s">🥊 开始战斗</button>
        <button onclick="GameBoxing.backToMenu()" style="padding:10px 20px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#64748b;font-size:12px;cursor:pointer;transition:all 0.2s">🔙 返回游戏选择</button>
      </div>
      <div style="margin-top:14px;font-size:10px;color:#4a4a6a">
        最高分: ${localStorage.getItem('bx_high_score') || '无'}
      </div>
    </div>
  `;
  
  // 按钮悬停效果
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// 返回游戏菜单（调用 tower-climb 的 init 显示选择界面）
window.GameBoxing = { init, start, backToMenu: function() {
  if (typeof Game !== 'undefined' && Game.init) {
    Game.init(); // tower-climb 的 init 显示游戏选择
  }
} };

})();
