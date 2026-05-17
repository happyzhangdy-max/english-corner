/**
 * tower-climb.js v6 — 学生→社畜剧情爬塔 + 楼层平台化 + 回血机制
 * 
 * 参考：「是男人就上100层」平台跳跃核心体验
 * 
 * 剧情：1~50F 是背书包的学生，Boss 是老师/家长
 *       51~100F 是穿西装的社畜，Boss 是同事/课长/社长
 */
;(function() {
'use strict';

// ============================================================
// 常量
// ============================================================
const MAX_HP = 5;
const COMBO_BONUS_THRESHOLD = 3;
const BOSS_CLEAR_REQUIRED = 5;
const VISIBLE_FLOORS = 5;

// 阶段定义
const PHASE_STUDENT = 'student';   // 1~50F
const PHASE_OFFICE = 'office';     // 51~100F

// Boss 配置：每阶段出现次数 + 可用 Boss 类型
const BOSS_CONFIG = [
  { phase: PHASE_STUDENT, count: 1, minFloor: 15, maxFloor: 48, bosses: [
    { id: 'teacher', icon: '👨‍🏫', name: '老师', color: '#3b82f6', lines: ['不准看其他同学的卷子！', '上课不准睡觉！', '这道题这么简单都不会？'] },
    { id: 'parent', icon: '👪', name: '家长', color: '#8b5cf6', lines: ['赶紧去学习！', '作业写了吗？', '考了多少分？'] },
  ]},
  { phase: PHASE_OFFICE, count: 3, minFloor: 55, maxFloor: 98, bosses: [
    { id: 'colleague', icon: '👔', name: '同事', color: '#f59e0b', lines: ['又在摸鱼？帮我看一下这个Excel……', '今天加班到几点？我陪你。', '中午吃什么？随便，我想不出来……'] },
    { id: 'kacho', icon: '👨‍💼', name: '课长', color: '#ef4444', lines: ['这个方案，今天下班前能改好吗？', '辛苦了——下周一之前再出一版。', '上个月的加班申请，还没批下来……'] },
    { id: 'shacho', icon: '👑', name: '社长', color: '#ec4899', lines: ['年轻人，有梦想是好事。不过先把PPT做完。', '今年不涨薪了，公司很难。你要理解。', '团建就是加班，换了个地方而已。'] },
  ]},
];

// Boss 实例列表（初始化时生成）
const BOSS_INSTANCES = [];

(function initBosses() {
  for (const config of BOSS_CONFIG) {
    const { minFloor, maxFloor, count, bosses } = config;
    const candidates = Array.from({length: maxFloor - minFloor + 1}, (_, i) => i + minFloor);
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const bossType = bosses[Math.floor(Math.random() * bosses.length)];
      BOSS_INSTANCES.push({
        floor: shuffled[i],
        boss: bossType,
        phase: config.phase,
      });
    }
  }
  BOSS_INSTANCES.sort((a,b) => a.floor - b.floor);
})();

const DIFFICULTY_TABLE = [
  { min: 1,    max: 10,  level: 'N5', time: 8000 },
  { min: 11,   max: 20,  level: 'N4', time: 7000 },
  { min: 21,   max: 35,  level: 'N3', time: 6000 },
  { min: 36,   max: 50,  level: 'N2', time: 5000 },
  { min: 51,   max: 999, level: 'N1', time: 4000 },
];

let _cachedByLevel = {};
let _cachedByLevelCn = {}; // 仅含中文释义的词，用于单词模式
let _cachedByCategory = {}; // 按场景分类缓存

// 判断字符串是否含中文字符
function hasChinese(str) {
  if (!str) return false;
  for (let i = 0; i < str.length; i++) {
    const cp = str.charCodeAt(i);
    if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) return true;
  }
  return false;
}

// 在句子中查找单词（含变形匹配）
// 返回 { found, matchText, matchStart }
function findWordInSentence(word, sentence) {
  if (!sentence) return { found: false, matchText: '', matchStart: -1 };
  // 1. 精确匹配
  const idx = sentence.indexOf(word);
  if (idx !== -1) return { found: true, matchText: word, matchStart: idx };
  // 2. Remove prefix/suffix from stem
  for (const n of [1, 2]) {
    if (word.length > n) {
      const stem = word.slice(0, -n);
      const si = sentence.indexOf(stem);
      if (si !== -1) return { found: true, matchText: stem, matchStart: si };
    }
  }
  return { found: false, matchText: '', matchStart: -1 };
}

// ============================================================
// 游戏状态
// ============================================================
let state = {
  floor: 0, hp: MAX_HP, maxHp: MAX_HP,
  combo: 0, maxCombo: 0, score: 0,
  isPlaying: false, isBoss: false, bossProgress: 0, currentBossFloor: -1, currentBossData: null,
  wrongWords: [], answeredWords: 0, correctWords: 0,
  // 答题模式
  quizMode: 'word',          // 'word' | 'sentence'
  // 选中的词库（默认全选）
  selectedLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  selectedCategories: [],     // 选中的场景分类（空=不限）
  // 回血机制
  healComboTarget: 0,      // 目标连击数（4~8 随机）
  healPending: false,       // 💊 已经达标，下一题答对就回血
  // 动画状态
  animating: false, animType: '',
  // 平台位置缓存（每层随机左右位置）
  platformX: {},            // { floor: 'left'|'center'|'right' }
  platformPosPct: {},       // { floor: 25.5 } 缓存精确百分位，确保渲染一致
};

let timerId = null, currentQuestion = null;
let el = {};

// ============================================================
// 工具
// ============================================================
function getDifficulty(floor) {
  for (const d of DIFFICULTY_TABLE) {
    if (floor >= d.min && floor <= d.max) return d;
  }
  return DIFFICULTY_TABLE[DIFFICULTY_TABLE.length - 1];
}

// 获取当前阶段
function getPhase(floor) {
  if (floor <= 50) return PHASE_STUDENT;
  return PHASE_OFFICE;
}

// 查找某一层是否有 Boss
function findBoss(floor) {
  return BOSS_INSTANCES.find(b => b.floor === floor) || null;
}

function cacheByLevel() {
  if (Object.keys(_cachedByLevel).length > 0) return;
  for (const w of VOCAB_DATA) {
    const lv = (w.level || 'N5').toUpperCase().replace(/^N/,'N');
    if (!_cachedByLevel[lv]) _cachedByLevel[lv] = [];
    _cachedByLevel[lv].push(w);
    // 同时按是否有中文释义分组
    if (!_cachedByLevelCn[lv]) _cachedByLevelCn[lv] = [];
    if (hasChinese(w.meaning)) {
      _cachedByLevelCn[lv].push(w);
    }
    // 按场景分类缓存
    const cat = w.category || '未分类';
    if (!_cachedByCategory[cat]) _cachedByCategory[cat] = [];
    _cachedByCategory[cat].push(w);
  }
}

function getRandomWords(level, exclude, count = 3, useCn = true) {
  // 从同难度层级的选中词库取干扰项
  let pool = [];
  const source = (useCn && (state.quizType || state.quizMode) === 'word') ? _cachedByLevelCn : _cachedByLevel;
  // 只取当前难度级别的词，确保干扰项与正确答案同级别
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  // 回退：取选中词库中最接近级别的词
  if (pool.length < count) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  if (pool.length === 0) {
    pool = _cachedByLevel[level] || _cachedByLevel['N5'];
  }
  
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

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 生成随机平台位置（左右交替，避免连续同侧）
function getPlatformX(floor) {
  if (state.platformX[floor]) return state.platformX[floor];
  const prev = state.platformX[floor - 1];
  const positions = ['left', 'center', 'right'];
  // 和前一层不同侧
  const filtered = prev ? positions.filter(p => p !== prev) : positions;
  const pick = filtered[Math.floor(Math.random() * filtered.length)];
  state.platformX[floor] = pick;
  return pick;
}

function posToPercent(pos, floor) {
  // 缓存确保同一层位置不变
  if (floor && state.platformPosPct[floor] !== undefined) return state.platformPosPct[floor];
  let val;
  switch(pos) {
    case 'left':   val = 15 + Math.random() * 15; break;  // 15~30%
    case 'right':  val = 55 + Math.random() * 15; break;  // 55~70%
    case 'center': val = 30 + Math.random() * 15; break;  // 30~45%
    default: val = 35;
  }
  if (floor) state.platformPosPct[floor] = val;
  return val;
}

// 楼层 → Y 百分比
function floorToY(floor, centerFloor) {
  const minY = 10, maxY = 80;
  const offset = floor - centerFloor;
  const step = (maxY - minY) / VISIBLE_FLOORS;
  return minY + (offset + VISIBLE_FLOORS/2) * step;
}

// 初始化回血目标
function initHealTarget() {
  state.healComboTarget = 4 + Math.floor(Math.random() * 5); // 4~8
  state.healPending = false;
}

// ============================================================
// 出题
// ============================================================
// 语音合成（自动发音）
// ============================================================
let _jpVoice = null;
let _voiceReady = false;

// 初始化语音：查找可用的日语声线
function initVoice() {
  if (_voiceReady) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // iOS Safari 需要异步加载，监听 voiceschanged
      window.speechSynthesis.onvoiceschanged = function() {
        const v = window.speechSynthesis.getVoices();
        _jpVoice = v.find(voice => voice.lang.startsWith('ja')) || null;
        _voiceReady = true;
      };
      return;
    }
    _jpVoice = voices.find(voice => voice.lang.startsWith('ja')) || null;
    _voiceReady = true;
  } catch(e) { /* 静默 */ }
}

function speak(text, lang = 'ja-JP') {
  try {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); // 打断上一个发音
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.8;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    // 手动指定日语声线（关键：防 iOS 读成中文）
    if (!_voiceReady) initVoice();
    if (_jpVoice) utter.voice = _jpVoice;
    window.speechSynthesis.speak(utter);
  } catch(e) { /* 静默失败，不影响游戏 */ }
}

// ============================================================
// 游戏音效（Web Audio API，小音量）
// ============================================================
const SFX = {};
(function initSFX() {
  let ctx = null;
  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return ctx;
  }
  function playTone(freq, duration, type, vol) {
    const c = getCtx();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime((vol || 0.08), c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch(e) {}
  }
  SFX.correct = function() {
    const c = getCtx(); if (!c) return;
    playTone(523, 0.12, 'sine', 0.07);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.07), 80);
  };
  SFX.wrong = function() {
    playTone(180, 0.3, 'sawtooth', 0.05);
  };
  SFX.jump = function() {
    const c = getCtx(); if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.18);
    } catch(e) {}
  };
  SFX.fall = function() {
    const c = getCtx(); if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.25);
      gain.gain.setValueAtTime(0.06, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.3);
    } catch(e) {}
  };
  SFX.bossAppear = function() {
    const notes = [330, 392, 523, 659];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'square', 0.04), i * 120));
  };
  SFX.bossClear = function() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.06), i * 100));
  };
  SFX.heal = function() {
    const c = getCtx(); if (!c) return;
    try {
      playTone(784, 0.1, 'sine', 0.05);
      setTimeout(() => playTone(988, 0.1, 'sine', 0.05), 60);
      setTimeout(() => playTone(1175, 0.2, 'sine', 0.05), 120);
    } catch(e) {}
  };
  SFX.combo = function() {
    playTone(880, 0.08, 'sine', 0.05);
  };
})();

// ============================================================
function generateQuestion() {
  const diff = getDifficulty(state.floor);
  const level = diff.level;
  // 从选中的词库中获取当前楼层难度的词
  let pool = [];
  // 词源：使用 quizType 代替旧的 quizMode
  var qType = state.quizType || state.quizMode || 'word';
  const source = (qType === 'word') ? _cachedByLevelCn : _cachedByLevel;
  // 优先：只取当前楼层难度级别的词
  if (state.selectedLevels.includes(level)) {
    const p = source[level];
    if (p && p.length) pool = pool.concat(p);
  }
  // 回退：当前难度不在选中词库中，取选中词库中最接近的级别
  if (pool.length === 0) {
    for (const lv of state.selectedLevels) {
      const p = source[lv];
      if (p && p.length) pool = pool.concat(p);
    }
  }
  // 二次回退：用楼层级别兜底
  if (pool.length === 0) {
    const fallback = (qType === 'word') ? _cachedByLevelCn : _cachedByLevel;
    pool = fallback[level] || _cachedByLevel['N5'] || _cachedByLevelCn['N5'];
  }
  if (!pool || pool.length === 0) return null;
  
  // 按场景分类过滤
  if (state.selectedCategories && state.selectedCategories.length > 0) {
    pool = pool.filter(function(w) { return state.selectedCategories.indexOf(w.category) >= 0; });
  }

  let word;
  let options;
  let questionType = qType;

  // "模拟试题"模式：四分之一的概率分别出四种题型
  if (questionType === 'mock') {
    var _r = Math.random();
    if (_r < 0.25) questionType = 'word';
    else if (_r < 0.5) questionType = 'sentence';
    else if (_r < 0.75) questionType = 'grammar';
    else questionType = 'word';
  }

  if (questionType === 'sentence') {
    // 例句模式：只选词真正出现在句中的好例句
    // 过滤条件：ex_jp 存在、长度 > 8、词能在句中匹配到
    const goodSentences = pool.filter(w => {
      if (!w.ex_jp || w.ex_jp.length <= 8) return false;
      return findWordInSentence(w.word, w.ex_jp).found;
    });
    if (goodSentences.length === 0) {
      questionType = 'word'; // 没有好例句就回退
    } else {
      word = goodSentences[Math.floor(Math.random() * goodSentences.length)];
    }
  }
  
  // 文法例句模式
  if (questionType === 'grammar') {
    var gData = (typeof GRAMMAR_DATA !== 'undefined') ? GRAMMAR_DATA : null;
    if (gData && gData.length > 0) {
      // 从难度匹配的文法中随机选一个
      var gPool = gData;
      var gLevel = level.toLowerCase().replace('n','');
      if (gLevel) {
        var gFiltered = gPool.filter(function(g) { return (g.level || '').toLowerCase() === gLevel; });
        if (gFiltered.length > 0) gPool = gFiltered;
      }
      var gItem = gPool[Math.floor(Math.random() * gPool.length)];
      if (gItem && gItem.ex_jp) {
        var gSentence = gItem.ex_jp;
        var gPattern = gItem.pattern || '';
        // 把文型用下划线替换（去掉 〜 符号）
        var gBlanked = gPattern;
        var gSearch = gPattern.replace(/〜/g, '');
        // 在句子中找到文法模式并替换为下划线
        var gIdx = gSentence.indexOf(gSearch);
        if (gIdx === -1) {
          // 尝试用 pattern 本身直接搜索
          var gParts = gPattern.replace(/〜/g, '___').split('___');
          var gBlankText = '';
          // 简单做法：取 pattern 去掉 〜 的内容
          gIdx = gSentence.indexOf(gPattern.replace(/〜/g, ''));
          if (gIdx === -1) {
            // 放弃，回退 word
            questionType = 'word';
          } else {
            gBlankText = gPattern.replace(/〜/g, '');
          }
        }
        if (questionType === 'grammar') {
          // 构建干扰：从其他文法取 3 个不同的 pattern
          var gWrongPool = gData.filter(function(g) { return g.pattern !== gItem.pattern; });
          var gShuffled = gWrongPool.sort(function() { return Math.random() - 0.5; });
          var gWrong = [];
          for (var gi = 0; gi < gShuffled.length && gWrong.length < 3; gi++) {
            if (gWrong.indexOf(gShuffled[gi].pattern) === -1) gWrong.push(gShuffled[gi].pattern);
          }
          
          var gBlankedSentence = gSentence;
          var gSearchText = gPattern.replace(/〜/g, '');
          var gIdx2 = gSentence.indexOf(gSearchText);
          if (gIdx2 >= 0) {
            gBlankedSentence = gSentence.slice(0, gIdx2) + '＿＿' + gSentence.slice(gIdx2 + gSearchText.length);
          } else {
            // 回退：直接用 pattern 替换
            gBlankedSentence = '＿＿（' + gItem.desc + '）';
          }
          
          var gOptions = [
            { text: gItem.pattern, correct: true },
          ];
          gWrong.forEach(function(p) {
            gOptions.push({ text: p, correct: false });
          });
          shuffle(gOptions);
          
          speak(gSentence);
          
          return {
            word: { word: gItem.pattern, meaning: gItem.meaning, reading: '', level: gItem.level },
            options: gOptions,
            displayWord: gBlankedSentence,
            displayReading: '',
            displaySentence: gSentence,
            displayMeaning: gItem.meaning || '',
            timeLimit: state.isBoss ? diff.time + 2000 : diff.time + 2000,
            level: (gItem.level || '').toUpperCase(),
            type: 'grammar',
          };
        }
      } else {
        questionType = 'word';
      }
    } else {
      questionType = 'word';
    }
  }
  
  if (!word) {
    // 单词模式（或回退）
    word = pool[Math.floor(Math.random() * pool.length)];
  }
  
  const distractors = getRandomWords(level, word.id, 3);

  if (questionType === 'sentence' && word.ex_jp) {
    // 例句模式：展示句子，空白处选词
    const sentence = word.ex_jp;
    const match = findWordInSentence(word.word, sentence);
    
    // 用匹配到的文字替换为下划线（只替换第一个匹配）
    let blanked = sentence;
    if (match.found) {
      blanked = sentence.slice(0, match.matchStart) +
        '＿＿' +
        sentence.slice(match.matchStart + match.matchText.length);
    }
    
    options = [
      { text: word.word, correct: true },
      ...distractors.map(w => ({ text: w.word, correct: false })),
    ];
    shuffle(options);

    // 自动朗读整句（直接调用，iOS Safari 不认 setTimeout 链）
    speak(sentence);

    return {
      word, options,
      displayWord: blanked,
      displayReading: word.reading || '',
      displaySentence: sentence,
      displayMeaning: word.meaning || '',
      timeLimit: state.isBoss ? diff.time - 1000 : diff.time,
      level,
      type: 'sentence',
    };
  } else {
    // 单词模式：显示单词选释义
    options = [
      { text: word.meaning || word.word, correct: true },
      ...distractors.map(w => ({ text: w.meaning || w.word, correct: false })),
    ];
    shuffle(options);

    // 自动朗读单词（直接调用，iOS Safari 不认 setTimeout 链）
    speak(word.word);

    return {
      word, options,
      displayWord: word.word,
      displayReading: word.reading || '',
      displaySentence: word.ex_jp || '',
      displayMeaning: word.meaning || '',
      timeLimit: state.isBoss ? diff.time - 1000 : diff.time,
      level,
      type: 'word',
    };
  }
}

// ============================================================
// 答题处理
// ============================================================
function handleAnswer(index) {
  if (!state.isPlaying || !currentQuestion || currentQuestion._answered || state.animating) return;
  currentQuestion._answered = true;
  clearTimeout(timerId);
  state.animating = true;

  const selected = currentQuestion.options[index];
  const isCorrect = selected && selected.correct;

  if (isCorrect) onCorrect();
  else onWrong(index);
}

function onCorrect() {
  state.combo++;
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  state.correctWords++;

  // 音效
  SFX.correct();
  if (state.combo >= COMBO_BONUS_THRESHOLD && state.combo % COMBO_BONUS_THRESHOLD === 0) {
    SFX.combo();
  }

  // ---- 回血系统 ----
  // 规则：连续答对 healComboTarget(4~8) 题后获得一次回血机会
  //       下一题答对 → ❤️+1；答错 → 机会消失 + 😅提示
  let healed = false;
  
  // ⚠️ 重要：先处理 boss 战逻辑，boss 战期间不触发回血
  if (state.isBoss) {
    // Boss 战逻辑
    state.bossProgress++;
    state.score += 50 * state.combo;
    if (state.bossProgress >= BOSS_CLEAR_REQUIRED) {
      // Boss 击倒！
      SFX.bossClear();
      state.score += 500;
      state.isBoss = false;
      state.currentBossFloor = -1;
      state.currentBossData = null;
      state.floor++;
      state.animType = 'bossClear';
      // Boss 清掉后重置回血进度
      state.combo = 0;
      initHealTarget();
      renderWorld(state.floor);
      renderHUD();
      renderQuizFeedback(true);
      showFloatText('🎉 Boss 击倒！+500', '#22c55e', 50);
      setTimeout(() => { state.animating = false; nextRound(); }, 1500);
      return;
    }
    // Boss 命中（未击倒）
    state.animType = 'bossHit';
    renderWorld(state.floor);
    renderHUD();
    renderQuizFeedback(true);
    showFloatText('💥', '#ef4444', 38);
    setTimeout(() => { state.animating = false; nextRound(); }, 500);
    return;
  }
  
  // ⚠️ 非 Boss 战 → 处理回血
  if (state.healPending) {
    // 💊 机会已就绪，这题答对就回血
    if (state.hp < state.maxHp) {
      state.hp++;
      healed = true;
    }
    state.healPending = false;
    initHealTarget(); // 进入下一轮
  }
  
  // combo 达标 → 激活回血机会（供下一题使用）
  if (!state.healPending && state.hp < state.maxHp && state.combo >= state.healComboTarget) {
    state.healPending = true;
  }

  // 普通答对：玩家跳到上一层
  const oldFloor = state.floor;
  state.floor++;
  SFX.jump();
  state.score += 10 * (Math.floor(state.combo / 3) + 1);
  state.animType = 'jump';
  
  // 渲染世界（更新新楼层布局）
  renderWorld(state.floor);
  renderHUD();
  renderQuizFeedback(true);

  // 角色跳跃动画（手脚张开 + 上升）
  const player = document.getElementById('game-player');
  if (player) {
    const charDiv = player.querySelector('.game-char');
    if (charDiv) charDiv.classList.add('jump');
    const newY = floorToY(state.floor, state.floor);
    const ppos = getPlatformX(state.floor);
    const newX = posToPercent(ppos, state.floor);
    player.style.transition = 'top 0.45s cubic-bezier(0.34,1.56,0.64,1), left 0.4s ease-out';
    player.style.top = newY + '%';
    player.style.left = newX + '%';
    // 着陆后手脚收拢
    setTimeout(() => {
      if (charDiv) charDiv.classList.remove('jump');
    }, 400);
  }

  // 回血反馈
  if (healed) {
    SFX.heal();
    showFloatText('❤️ +1 回血！', '#ef4444', 44);
  } else if (state.healPending && state.hp < state.maxHp) {
    showFloatText('💊 下题答对回血！', '#4ade80', 28);
  }

  // 🎉 每20层大字庆祝
  if (state.floor % 20 === 0) {
    setTimeout(() => showFloorCelebration(state.floor), 300);
  }

  // Boss 检查
  const bossHere = findBoss(state.floor);
  if (bossHere && !state.isBoss) {
    SFX.bossAppear();
    state.isBoss = true;
    state.bossProgress = 0;
    state.currentBossFloor = state.floor;
    state.currentBossData = bossHere.boss;
    setTimeout(() => {
      state.animating = false;
      // Boss 出现浮字
      showFloatText(`${bossHere.boss.icon} ${bossHere.boss.name} 出现！`, bossHere.boss.color, 36);
      // Boss 说随机台词 — 用独立元素，不会被 renderWorld 清掉
      if (bossHere.boss.lines && bossHere.boss.lines.length > 0) {
        const line = bossHere.boss.lines[Math.floor(Math.random() * bossHere.boss.lines.length)];
        const world = document.getElementById('gh-world');
        if (world) {
          const bubble = document.createElement('div');
          bubble.textContent = `💬 ${line}`;
          bubble.style.cssText = `
            position:absolute; top:35%; left:50%; transform:translateX(-50%);
            font-size:14px; font-weight:700; color:#fff;
            background:rgba(0,0,0,0.75); padding:8px 16px; border-radius:12px;
            border:1px solid rgba(255,255,255,0.15);
            z-index:30; pointer-events:none; white-space:nowrap;
            animation:fadeIn 0.4s ease-out;
          `;
          bubble.id = 'gh-boss-speech';
          world.appendChild(bubble);
        }
      }
      setTimeout(nextRound, 2200);
    }, 500);
    return;
  }

  // 新的回血目标（达标后重置）
  if (state.combo >= state.healComboTarget) {
    initHealTarget();
  }

  setTimeout(() => { state.animating = false; nextRound(); }, 480);
}

function onWrong(index) {
  SFX.wrong();
  SFX.fall();
  
  // 回血机会被浪费的反馈
  const hadHealChance = state.healPending;
  
  state.combo = 0;
  state.hp--;
  state.healPending = false; // 连击断了，回血机会消失
  
  if (currentQuestion && currentQuestion.word) {
    state.wrongWords.push(currentQuestion.word);
  }

  const oldFloor = state.floor;
  if (state.floor > 1) state.floor--;
  state.animType = 'fall';

  // 重新设定回血目标
  initHealTarget();

  renderWorld(state.floor);
  renderHUD();
  renderQuizFeedback(false, index);

  // 角色下落动画（手脚收拢 + 下坠）
  const player = document.getElementById('game-player');
  if (player) {
    const charDiv = player.querySelector('.game-char');
    if (charDiv) charDiv.classList.add('fall');
    const newY = floorToY(state.floor, state.floor);
    const ppos = getPlatformX(state.floor);
    const newX = posToPercent(ppos, state.floor);
    player.style.transition = 'top 0.5s ease-in, left 0.4s ease-out';
    player.style.top = newY + '%';
    player.style.left = newX + '%';
    setTimeout(() => {
      if (charDiv) charDiv.classList.remove('fall');
    }, 400);
  }

  // 屏幕震动
  const world = document.getElementById('gh-world');
  if (world) {
    world.style.animation = 'screenShake 0.35s ease-out';
    setTimeout(() => { if (world) world.style.animation = ''; }, 350);
  }

  // 可惜反馈：本来有回血机会的
  if (hadHealChance) {
    showFloatText('😅 可惜！回血机会没了', '#fbbf24', 30);
  }

  if (state.hp <= 0) {
    setTimeout(() => { state.animating = false; gameOver(); }, 700);
  } else {
    setTimeout(() => { state.animating = false; nextRound(); }, 580);
  }
}

function onTimeout() {
  SFX.wrong();
  SFX.fall();
  const hadHealChance = state.healPending;
  state.combo = 0;
  state.hp--;
  state.healPending = false;
  
  if (currentQuestion && currentQuestion.word) {
    state.wrongWords.push(currentQuestion.word);
  }
  if (state.floor > 1) state.floor--;
  initHealTarget();

  renderWorld(state.floor);
  renderHUD();
  
  const player = document.getElementById('game-player');
  if (player) {
    const charDiv = player.querySelector('.game-char');
    if (charDiv) charDiv.classList.add('fall');
    const newY = floorToY(state.floor, state.floor);
    const ppos = getPlatformX(state.floor);
    const newX = posToPercent(ppos, state.floor);
    player.style.transition = 'top 0.5s ease-in, left 0.4s ease-out';
    player.style.top = newY + '%';
    player.style.left = newX + '%';
    setTimeout(() => {
      if (charDiv) charDiv.classList.remove('fall');
    }, 400);
  }
  const world = document.getElementById('gh-world');
  if (world) {
    world.style.animation = 'screenShake 0.25s ease-out';
    setTimeout(() => { if (world) world.style.animation = ''; }, 250);
  }

  if (hadHealChance) {
    showFloatText('😅 可惜！回血机会没了', '#fbbf24', 30);
  }

  renderQuizFeedback(false, -1);
  if (state.hp <= 0) setTimeout(() => { state.animating = false; gameOver(); }, 700);
  else setTimeout(() => { state.animating = false; nextRound(); }, 580);
}

// 浮动大字特效
function showFloatText(text, color, size = 32) {
  const world = document.getElementById('gh-world');
  if (!world) return;
  const div = document.createElement('div');
  div.textContent = text;
  div.style.cssText = `
    position:absolute; top:45%; left:50%; transform:translate(-50%,-50%);
    font-size:${size}px; font-weight:900; color:${color};
    text-shadow:0 0 30px ${color}44, 0 0 60px ${color}22;
    z-index:20; pointer-events:none;
    animation:floatTextUp 1.2s ease-out forwards;
  `;
  world.appendChild(div);
  setTimeout(() => div.remove(), 1300);
}

// ============================================================
// 🎉 每20层大字庆祝
// ============================================================
function showFloorCelebration(floor) {
  const container = document.getElementById('p-game');
  if (!container) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'gh-celebration';
  overlay.style.cssText = `
    position:absolute;inset:0;z-index:100;
    display:flex;align-items:center;justify-content:center;
    background:radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%);
    animation:celebFadeIn 0.5s ease-out;
    pointer-events:none;
  `;
  overlay.innerHTML = `
    <div style="text-align:center;animation:celebScale 0.6s cubic-bezier(0.34,1.56,0.64,1), celebPulse 2s ease-in-out infinite;padding:30px;border-radius:24px;background:radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);box-shadow:0 0 60px rgba(168,85,247,0.15)">
      <div style="font-size:56px;margin-bottom:8px;line-height:1.2">🎉</div>
      <div style="font-size:34px;font-weight:900;color:#fff;text-shadow:0 0 30px rgba(168,85,247,0.6),0 0 60px rgba(168,85,247,0.3);letter-spacing:2px;line-height:1.3">你已经爬了 ${floor} 层了！</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.5);margin-top:8px;letter-spacing:4px">✦ 继续向上 ✦</div>
    </div>
  `;
  container.appendChild(overlay);
  
  // 自动消失（2.5秒后淡出）
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.8s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 800);
  }, 2500);
}

// ============================================================
// 渲染：世界（平台 + 玩家 + Boss）
// ============================================================
function renderWorld(centerFloor) {
  const world = document.getElementById('gh-world');
  if (!world) return;
  
  // 清理 Boss 台词气泡（独立元素，不被 innerHTML 清掉）
  const oldBubble = document.getElementById('gh-boss-speech');
  if (oldBubble) oldBubble.remove();
  
  const center = centerFloor || state.floor;
  const half = Math.floor(VISIBLE_FLOORS / 2);
  const startFloor = Math.max(1, center - half);
  const endFloor = center + half;
  
  let html = `<div style="position:relative;width:100%;height:100%;overflow:hidden;background:linear-gradient(180deg,#0b0b1e,#15133a,#0b0b1e)">`;
  
  for (let f = startFloor; f <= endFloor; f++) {
    const y = floorToY(f, center);
    const pos = getPlatformX(f);
    const x = posToPercent(pos, f);
    const isCurrent = f === state.floor;
    const isPast = f < state.floor;
    const isFuture = f > state.floor;
    const isBossFloor = f === state.currentBossFloor && state.isBoss;
    
    // 平台宽度（当前层宽，其他层稍窄）
    const width = isCurrent ? '22%' : '16%';
    
    // 平台颜色
    let lineColor, glowColor;
    if (isBossFloor) {
      lineColor = '#ef4444';
      glowColor = 'rgba(239,68,68,0.3)';
    } else if (isCurrent) {
      lineColor = '#a855f7';
      glowColor = 'rgba(168,85,247,0.25)';
    } else if (isPast) {
      lineColor = 'rgba(148,163,184,0.15)';
      glowColor = 'transparent';
    } else {
      lineColor = 'rgba(148,163,184,0.2)';
      glowColor = 'transparent';
    }
    
    // 平台渲染：圆角胶囊形线段
    html += `<div style="position:absolute;left:${x}%;top:${y}%;width:${width};height:${isCurrent?'5px':'3px'};
      background:${lineColor};border-radius:3px;transform:translateX(-50%);
      box-shadow:0 0 ${isCurrent?'12':'4'}px ${glowColor};
      transition:all 0.3s;
      ${isBossFloor ? 'border:1px solid rgba(239,68,68,0.4);' : ''}
    "></div>`;
    
    // 楼层号
    if (f % 5 === 0 || isCurrent) {
      html += `<div style="position:absolute;right:4%;top:${y-1.2}%;font-size:${isCurrent?'10px':'7px'};
        color:${isCurrent?'#a78bfa':'#1e293b'};font-weight:${isCurrent?'700':'400'};
        transition:all 0.3s;letter-spacing:0.5px">${f}F</div>`;
    }
    
    // Boss 标记
    if (isBossFloor && state.isBoss && state.currentBossData) {
      const bd = state.currentBossData;
      const bossHP = state.bossProgress;
      html += `<div style="position:absolute;left:${x}%;top:${y-4}%;transform:translateX(-50%);
        font-size:28px;filter:drop-shadow(0 0 15px ${bd.color}66);
        animation:bounceIn 0.5s ease-out">${bd.icon}</div>`;
      // Boss 血量点
      html += `<div style="position:absolute;left:${x}%;top:${y-7.5}%;transform:translateX(-50%);
        display:flex;gap:3px">
        ${Array.from({length: BOSS_CLEAR_REQUIRED}, (_, i) =>
          `<span style="font-size:7px;color:${i < bossHP ? '#22c55e' : bd.color}">●</span>`
        ).join('')}
      </div>`;
    }
    
    // 已过的楼层的星星装饰
    if (isPast && f % 4 === 0) {
      const starSide = (f % 8 < 4) ? 'left' : 'right';
      const starX = starSide === 'left' ? 8 : 85;
      html += `<div style="position:absolute;left:${starX}%;top:${y}%;font-size:5px;color:#fbbf24;opacity:0.3">✦</div>`;
    }
  }
  
  // 玩家——根据阶段切换形象（学生/社畜）
  const playerX = posToPercent(getPlatformX(state.floor), state.floor);
  const playerY = floorToY(state.floor, center);
  const phase = getPhase(state.floor);
  const charClass = phase === PHASE_STUDENT ? 'game-char student' : 'game-char office';
  
  let charHTML;
  if (phase === PHASE_STUDENT) {
    // 👨‍🎓 学生：背书包
    charHTML = `
      <div class="${charClass}">
        <div class="gc-backpack"></div>
        <div class="gc-head"></div>
        <div class="gc-body"></div>
        <div class="gc-arm l"></div>
        <div class="gc-arm r"></div>
        <div class="gc-leg l"></div>
        <div class="gc-leg r"></div>
      </div>`;
  } else {
    // 👔 社畜：穿西装打领带
    charHTML = `
      <div class="${charClass}">
        <div class="gc-head"></div>
        <div class="gc-body"></div>
        <div class="gc-tie"></div>
        <div class="gc-arm l"></div>
        <div class="gc-arm r"></div>
        <div class="gc-leg l"></div>
        <div class="gc-leg r"></div>
      </div>`;
  }
  
  html += `<div id="game-player" style="position:absolute;left:${playerX}%;top:${playerY}%;
    transform:translateX(-50%) scale(1);
    z-index:5;transition:none;
    filter:drop-shadow(0 0 14px rgba(168,85,247,0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))">
    ${charHTML}
  </div>`;
  
  // Boss 战提示横幅
  if (state.isBoss && state.currentBossFloor > 0 && state.currentBossData) {
    const bd = state.currentBossData;
    html += `<div style="position:absolute;top:4%;left:50%;transform:translateX(-50%);
      font-size:10px;font-weight:700;color:${bd.color};
      background:${bd.color}1a;padding:3px 14px;border-radius:10px;
      border:1px solid ${bd.color}33;white-space:nowrap;
      animation:pulse 1s ease-in-out infinite">
      ${bd.icon} ${bd.name} ${state.bossProgress}/${BOSS_CLEAR_REQUIRED}
    </div>`;
  }
  
  // 回血预告
  if (state.healPending && !state.isBoss && state.hp < state.maxHp) {
    html += `<div style="position:absolute;top:12%;left:50%;transform:translateX(-50%);
      font-size:13px;font-weight:800;color:#4ade80;
      text-shadow:0 0 20px rgba(74,222,128,0.3);
      animation:pulse 0.8s ease-in-out infinite;
      pointer-events:none;z-index:8">💊 回血机会！</div>`;
  }
  
  // Combo 大字
  if (state.combo >= COMBO_BONUS_THRESHOLD && state.isPlaying) {
    const hue = (state.combo * 25) % 360;
    const comboText = state.healPending ? `🔥 ${state.combo}连击 💊` : `🔥 ${state.combo}连击`;
    html += `<div style="position:absolute;top:14%;left:50%;transform:translateX(-50%);
      font-size:28px;font-weight:900;
      color:hsl(${hue},80%,60%);
      text-shadow:0 0 30px hsla(${hue},80%,60%,0.5),0 0 60px hsla(${hue},80%,60%,0.2);
      animation:comboPop 0.6s ease-out;pointer-events:none;z-index:10">${comboText}</div>`;
  }
  
  html += '</div>';
  world.innerHTML = html;
}

function renderHUD() {
  const hearts = '❤️'.repeat(state.hp) + '🖤'.repeat(state.maxHp - state.hp);
  if (el.hudFloor) el.hudFloor.textContent = `🏔️ ${state.floor}F`;
  if (el.hudHp) el.hudHp.innerHTML = hearts;
  if (el.hudScore) el.hudScore.textContent = `🎯 ${state.score}`;
  if (el.floorCounterBig) el.floorCounterBig.textContent = state.floor;
  
  // 回血进度指示
  const healEl = document.getElementById('gh-heal-progress');
  if (healEl) {
    const combo = state.combo;
    const target = state.healComboTarget;
    if (state.healPending) {
      healEl.innerHTML = '💊 <span style="color:#4ade80;font-weight:700">回血就绪</span>';
      healEl.style.opacity = '1';
      healEl.style.color = '#4ade80';
    } else if (state.hp < state.maxHp && !state.isBoss) {
      const pct = Math.min(combo / target * 100, 100);
      healEl.innerHTML = '💊 ' + combo + '/' + target;
      healEl.style.opacity = '0.7';
      healEl.style.color = combo >= target - 1 ? '#fbbf24' : '#94a3b8';
    } else {
      healEl.style.opacity = '0.3';
      healEl.innerHTML = '💊 --';
      healEl.style.color = '#64748b';
    }
  }
}

// ============================================================
// 出题区
// ============================================================
function renderQuiz() {
  if (!currentQuestion) { el.quizArea.innerHTML = ''; return; }
  
  const q = currentQuestion;
  const word = q.word;
  const timeMs = q.timeLimit || 8000;
  
  let hintText = state.isBoss ? '👹 Boss 战！答对攻击' : '';
  if (state.isBoss) {
    hintText = '👹 Boss 战！答对攻击';
  } else if (state.healPending) {
    hintText = '💊 答对回血！';
  } else if (q.type === 'sentence') {
    hintText = 'Choose the correct word';
  } else if (q.type === 'grammar') {
    hintText = 'Choose the correct pattern';
  } else {
    hintText = 'Choose the correct meaning';
  }
  
  var qtLabel = '';
  var _qt = state.quizType || 'word';
  if (_qt === 'mock') qtLabel = '📋 模拟';
  else if (_qt === 'sentence') qtLabel = '💬 例句';
  else if (_qt === 'grammar') qtLabel = '📐 文法';
  else qtLabel = '📖 单词';
  
  let html = `
    <div id="quiz-card" style="padding:10px 14px 14px;animation:slideUp 0.3s ease-out">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:10px;color:#64748b">${qtLabel} ${q.level} · ${state.floor}F ${state.isBoss ? '👹' : '🏔️'}</span>
        <span style="font-size:10px;color:#64748b">正答 ${state.correctWords}/${state.answeredWords}</span>
      </div>
      <div style="text-align:center;margin-bottom:5px;min-height:${(q.type === 'sentence' || q.type === 'grammar') ? '64px' : '50px'}">
  `;
  
  if (q.type === 'sentence' || q.type === 'grammar') {
    // 例句模式：展示句子填空
    const meaningLine = q.displayMeaning ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">（${q.displayMeaning}）</div>` : '';
    html += `
        <div style="font-size:15px;font-weight:600;color:#e2e8f0;line-height:1.7">${q.displayWord}</div>
        ${meaningLine}
        <div style="font-size:10px;color:#64748b;margin-top:3px">${hintText}</div>`;
  } else {
    // 单词模式：展示单词
    // 根据 displayMode 切换显示
    var dm = state.displayMode || 0;
    var wordHtml = '';
    if (dm === 0) {
      // 汉字大 + 假名小
      wordHtml = '<div style="font-size:20px;font-weight:700;color:#e2e8f0;letter-spacing:1px">'+word.word+'</div>'+
        (word.reading ? '<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+word.reading+'</div>' : '');
    } else if (dm === 1) {
      // 假名大 + 汉字小
      wordHtml = (word.reading ? '<div style="font-size:20px;font-weight:700;color:#fbbf24;letter-spacing:1px">'+word.reading+'</div>' : '')+
        '<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+word.word+'</div>';
    } else {
      // 仅假名
      wordHtml = word.reading ? '<div style="font-size:20px;font-weight:700;color:#4ade80;letter-spacing:1px">'+word.reading+'</div>' : '';
    }
    html += wordHtml + '<div style="font-size:10px;color:#64748b;margin-top:2px">'+hintText+'</div>';
  }
  
  html += `
      </div>
      <div id="quiz-options" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
  `;
  
  q.options.forEach((opt, i) => {
    html += `<button class="game-opt-btn" data-index="${i}" style="padding:11px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#e2e8f0;font-size:13px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent">${opt.text}</button>`;
  });
  
  html += `
      </div>
      <div style="margin-top:7px;height:3px;background:rgba(168,85,247,0.1);border-radius:2px;overflow:hidden;position:relative">
        <div id="game-timer-bar" style="height:100%;width:100%;background:linear-gradient(90deg,#a855f7,#e94560);border-radius:2px;transition:width ${timeMs}ms linear"></div>
      </div>
    </div>
  `;
  
  el.quizArea.innerHTML = html;
  
  document.querySelectorAll('.game-opt-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      handleAnswer(parseInt(this.dataset.index));
    });
  });
  
  requestAnimationFrame(() => {
    const bar = document.getElementById('game-timer-bar');
    if (bar) bar.style.width = '0%';
  });
}

function renderQuizFeedback(isCorrect, wrongIndex) {
  document.querySelectorAll('.game-opt-btn').forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (currentQuestion && currentQuestion.options[i] && currentQuestion.options[i].correct) {
      btn.style.borderColor = 'rgba(34,197,94,0.5)';
      btn.style.background = 'rgba(34,197,94,0.1)';
    }
    if (!isCorrect && i === wrongIndex) {
      btn.style.borderColor = 'rgba(239,68,68,0.5)';
      btn.style.background = 'rgba(239,68,68,0.1)';
      btn.style.animation = 'shake 0.3s ease-out';
    }
  });

  const card = document.getElementById('quiz-card');
  if (card && isCorrect && state.healPending) {
    card.style.boxShadow = 'inset 0 0 25px rgba(74,222,128,0.2)';
    setTimeout(() => { if (card) card.style.boxShadow = ''; }, 500);
  } else if (card && isCorrect) {
    card.style.boxShadow = 'inset 0 0 15px rgba(34,197,94,0.12)';
    setTimeout(() => { if (card) card.style.boxShadow = ''; }, 350);
  }
}

// ============================================================
// 游戏流程
// ============================================================
function gameOver() {
  state.isPlaying = false;
  clearTimeout(timerId);
  
  // 保存错词到爬塔专属生词本（localStorage）
  const saved = JSON.parse(localStorage.getItem('towerWrongWords') || '[]');
  const existingIds = new Set(saved.map(w => w.id));
  for (const w of state.wrongWords) {
    if (!existingIds.has(w.id)) {
      saved.push({ id: w.id, word: w.word, meaning: w.meaning, reading: w.reading, ts: Date.now() });
      existingIds.add(w.id);
    }
  }
  localStorage.setItem('towerWrongWords', JSON.stringify(saved));
  
  // 保存错词到主生词本（jp_book）
  let bookAddCount = 0;
  try {
    var bookKey = 'jp_book';
    var book = JSON.parse(localStorage.getItem(bookKey) || '[]');
    // 扁平化去重检查（支持 vocab 和 ai 两种格式）
    var idSet = new Set();
    for (var bi = 0; bi < book.length; bi++) {
      if (book[bi].type === 'vocab' && book[bi].id) idSet.add(book[bi].id);
      else if (book[bi].type === 'ai' && book[bi].word) idSet.add('ai:' + book[bi].word);
    }
    for (var wi = 0; wi < state.wrongWords.length; wi++) {
      var w = state.wrongWords[wi];
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
  
  // 保存最高楼层
  const prev = parseInt(localStorage.getItem('tower_high_floor') || '0');
  if (state.floor > prev) localStorage.setItem('tower_high_floor', state.floor);
  
  const world = document.getElementById('gh-world');
  if (world) {
    const wrongList = state.wrongWords.slice(0, 20);
    const totalSaved = saved.length;
    
    world.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:18px;text-align:center;animation:fadeIn 0.5s ease-out">
        <div style="font-size:42px;margin-bottom:6px;animation:bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)">💀</div>
        <div style="font-size:18px;font-weight:700;background:linear-gradient(135deg,#e94560,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">游戏结束</div>
        <div style="display:flex;gap:12px;margin:6px 0;font-size:12px;color:#94a3b8">
          <span>🏔️ <span style="color:#fbbf24;font-weight:700">${state.floor}F</span></span>
          <span>🔥 <span style="color:#a855f7;font-weight:700">${state.maxCombo}</span></span>
          <span>⭐ <span style="color:#fbbf24;font-weight:700">${state.score}</span></span>
          <span>🎯 <span style="color:#22c55e;font-weight:700">${state.answeredWords > 0 ? Math.round(state.correctWords/state.answeredWords*100) : 0}%</span></span>
          <span>📝 <span style="color:#f87171;font-weight:700">${state.answeredWords}题</span></span>
        </div>
        ${wrongList.length > 0 ? `
          <div style="width:100%;max-width:280px;margin-top:8px;background:rgba(239,68,68,0.06);border-radius:10px;padding:8px 10px;border:1px solid rgba(239,68,68,0.12)">
            <div style="font-size:11px;color:#f87171;font-weight:600;margin-bottom:4px">📝 本局错词 (${state.wrongWords.length}) · 已加入生词本 ✅</div>
            <div style="max-height:60px;overflow-y:auto;font-size:10px;color:#fca5a5;line-height:1.8">
              ${wrongList.map(w => `<span style="display:inline-block;margin:0 3px;padding:0 6px;background:rgba(239,68,68,0.08);border-radius:4px">${w.word}</span>`).join('')}
            </div>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#64748b">累计存档 ${totalSaved} 词 · ${bookAddCount > 0 ? '生词本 +' + bookAddCount : ''}</div>
        ` : `
          <div style="margin-top:8px;font-size:11px;color:#22c55e">🎉 没有错词！太棒了！</div>
        `}
        <div style="display:flex;gap:8px;margin-top:10px">
          <button onclick="Game.start()" style="padding:7px 22px;border-radius:18px;border:1px solid #a855f7;background:rgba(168,85,247,0.15);color:#a855f7;font-size:12px;cursor:pointer;transition:all 0.2s">🔄 再来一次</button>
          <button onclick="Game.showWrongBook()" style="padding:7px 18px;border-radius:18px;border:1px solid #f87171;background:rgba(248,113,113,0.1);color:#f87171;font-size:12px;cursor:pointer;transition:all 0.2s">📖 爬塔错词 (${totalSaved})</button>
        </div>
      </div>
    `;
  }
  el.quizArea.innerHTML = '';
}

// 展示生词本
function showWrongBook() {
  const saved = JSON.parse(localStorage.getItem('towerWrongWords') || '[]');
  const world = document.getElementById('gh-world');
  if (!world) return;
  
  if (saved.length === 0) {
    world.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;animation:fadeIn 0.3s ease-out">
        <div style="font-size:48px;margin-bottom:8px">📖</div>
        <div style="font-size:16px;color:#94a3b8">生词本还是空的</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">多玩几局就会自动收录错词</div>
        <button onclick="Game.init()" style="margin-top:14px;padding:7px 22px;border-radius:18px;border:1px solid #a855f7;background:rgba(168,85,247,0.15);color:#a855f7;font-size:12px;cursor:pointer">🔙 返回</button>
      </div>`;
    el.quizArea.innerHTML = '';
    return;
  }
  
  let html = `
    <div style="display:flex;flex-direction:column;align-items:center;height:100%;padding:14px;text-align:center;animation:fadeIn 0.3s ease-out">
      <div style="font-size:14px;font-weight:600;color:#f87171;margin-bottom:6px">📖 生词本 (${saved.length})</div>
      <div style="width:100%;max-width:320px;flex:1;overflow-y:auto;background:rgba(255,255,255,0.03);border-radius:10px;padding:8px;margin-bottom:6px">
        ${saved.map((w, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px">
            <div style="text-align:left">
              <span style="color:#e2e8f0;font-weight:600">${w.word}</span>
              ${w.reading ? `<span style="color:#94a3b8;font-size:10px;margin-left:4px">(${w.reading})</span>` : ''}
              <div style="color:#64748b;font-size:10px">${w.meaning || ''}</div>
            </div>
            <button onclick="Game.deleteWrongWord(${i})" style="font-size:14px;background:none;border:none;color:#ef4444;cursor:pointer;padding:2px 6px;opacity:0.5">✕</button>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="Game.init()" style="padding:7px 22px;border-radius:18px;border:1px solid #a855f7;background:rgba(168,85,247,0.15);color:#a855f7;font-size:12px;cursor:pointer">🔙 返回</button>
        <button onclick="Game.clearWrongBook()" style="padding:7px 16px;border-radius:18px;border:1px solid #ef4444;background:rgba(239,68,68,0.08);color:#ef4444;font-size:11px;cursor:pointer">🗑️ 清空</button>
      </div>
    </div>`;
  
  world.innerHTML = html;
  el.quizArea.innerHTML = '';
}

function deleteWrongWord(index) {
  const saved = JSON.parse(localStorage.getItem('towerWrongWords') || '[]');
  if (index >= 0 && index < saved.length) saved.splice(index, 1);
  localStorage.setItem('towerWrongWords', JSON.stringify(saved));
  showWrongBook();
}

function clearWrongBook() {
  if (confirm('确定清空生词本？')) {
    localStorage.removeItem('towerWrongWords');
    showWrongBook();
  }
}

function nextRound() {
  if (!state.isPlaying) return;
  state.animating = false;
  currentQuestion = generateQuestion();
  if (!currentQuestion) { gameOver(); return; }
  currentQuestion._answered = false;
  state.answeredWords++;
  renderQuiz();
  startTimer();
}

function startTimer() {
  clearTimeout(timerId);
  if (!currentQuestion) return;
  timerId = setTimeout(() => {
    if (currentQuestion && !currentQuestion._answered) {
      currentQuestion._answered = true;
      onTimeout();
    }
  }, currentQuestion.timeLimit || 8000);
}

// ============================================================
// 初始化
// ============================================================
// ============================================================
// 游戏菜单（替换原先直接显示爬塔的 init）
// ============================================================
// 游戏选择菜单（含单词分类选择）
// 使用事件委托处理所有点击，避免 onclick 全局作用域问题
var _gmSettings = null; // 缓存设置，避免频繁 localStorage

function _gmLoadSettings() {
  if (_gmSettings) return _gmSettings;
  var s = JSON.parse(localStorage.getItem('game_settings') || '{}');
  _gmSettings = {
    lvlOn: s.lvlOn !== false,
    selLvls: s.selLvls || ['N5','N4','N3'],
    catOn: s.catOn || false,
    selCats: s.selCats || [],
    displayMode: s.displayMode !== undefined ? s.displayMode : 0,
    quizType: s.quizType || 'word',
  };
  return _gmSettings;
}
function _gmSaveSettings() {
  if (_gmSettings) localStorage.setItem('game_settings', JSON.stringify(_gmSettings));
}
function _gmClearCache() { _gmSettings = null; }

function _gmHandleClick(e) {
  var target = e.target;
  var action = target.getAttribute('data-gm');
  if (!action) {
    // 可能点击了子元素，向上找
    target = target.closest('[data-gm]');
    if (!target) return;
    action = target.getAttribute('data-gm');
  }
  
  var s = _gmLoadSettings();
  
  if (action === 'toggle-lvl-section') {
    s.lvlOn = !s.lvlOn;
    _gmSaveSettings();
    var cb = document.getElementById('gm-cb-lvl');
    var body = document.getElementById('gm-lvl-body');
    if (cb) { cb.textContent = s.lvlOn ? '☑' : '☐'; cb.classList.toggle('gm-checked', s.lvlOn); }
    if (body) { body.style.opacity = s.lvlOn ? '1' : '0.35'; body.style.pointerEvents = s.lvlOn ? '' : 'none'; }
    return;
  }
  
  if (action === 'toggle-cat-section') {
    s.catOn = !s.catOn;
    _gmSaveSettings();
    var cb = document.getElementById('gm-cb-cat');
    var body = document.getElementById('gm-cat-body');
    if (cb) { cb.textContent = s.catOn ? '☑' : '☐'; cb.classList.toggle('gm-checked', s.catOn); }
    if (body) { body.style.opacity = s.catOn ? '1' : '0.35'; body.style.pointerEvents = s.catOn ? '' : 'none'; }
    return;
  }
  
  if (action === 'toggle-lvl') {
    var lvl = target.getAttribute('data-lvl');
    if (!lvl) return;
    var idx = s.selLvls.indexOf(lvl);
    if (idx >= 0) { s.selLvls.splice(idx, 1); } else { s.selLvls.push(lvl); }
    if (s.selLvls.length === 0) s.selLvls = [lvl];
    _gmSaveSettings();
    target.classList.toggle('gm-tag-on');
    target.style.background = target.classList.contains('gm-tag-on')
      ? 'linear-gradient(135deg,#e94560,#ff6b9d)' : 'rgba(255,255,255,0.06)';
    target.style.color = target.classList.contains('gm-tag-on') ? '#fff' : '#64748b';
    return;
  }
  
  if (action === 'toggle-cat') {
    var cat = target.getAttribute('data-cat');
    if (!cat) return;
    var idx = s.selCats.indexOf(cat);
    if (idx >= 0) { s.selCats.splice(idx, 1); } else { s.selCats.push(cat); }
    _gmSaveSettings();
    target.classList.toggle('gm-tag-on');
    target.style.background = target.classList.contains('gm-tag-on')
      ? 'linear-gradient(135deg,#e94560,#ff6b9d)' : 'rgba(255,255,255,0.06)';
    target.style.color = target.classList.contains('gm-tag-on') ? '#fff' : '#64748b';
    return;
  }
  
  if (action === 'toggle-display') {
    s.displayMode = (s.displayMode + 1) % 3;
    _gmSaveSettings();
    var btn = document.getElementById('gm-display-btn');
    var labels = ['📖 汉字大+假名小', '🔊 假名大+汉字小', '🎧 仅假名'];
    var icons = ['📖', '🔊', '🎧'];
    if (btn) {
      btn.textContent = icons[s.displayMode] + ' ' + ['汉字大', '假名大', '仅假名'][s.displayMode];
      btn.style.background = ['rgba(168,85,247,0.15)', 'rgba(251,191,36,0.15)', 'rgba(52,211,153,0.15)'][s.displayMode];
      btn.style.borderColor = ['rgba(168,85,247,0.4)', 'rgba(251,191,36,0.4)', 'rgba(52,211,153,0.4)'][s.displayMode];
      btn.style.color = ['#c4b5fd', '#fbbf24', '#4ade80'][s.displayMode];
    }
    return;
  }
  
  if (action === 'toggle-quiztype') {
    var _qtCycle = ['word', 'sentence', 'grammar', 'mock'];
    var _qtIdx = _qtCycle.indexOf(s.quizType || 'word');
    s.quizType = _qtCycle[(_qtIdx + 1) % 4];
    _gmSaveSettings();
    var btn = document.getElementById('gm-quiztype-btn');
    var _qLabels = { word:'单词', sentence:'例句', grammar:'文法例句', mock:'模拟试题' };
    var _qBg = { word:'rgba(168,85,247,0.15)', sentence:'rgba(251,191,36,0.15)', grammar:'rgba(52,211,153,0.15)', mock:'rgba(239,68,68,0.15)' };
    var _qBd = { word:'rgba(168,85,247,0.4)', sentence:'rgba(251,191,36,0.4)', grammar:'rgba(52,211,153,0.4)', mock:'rgba(239,68,68,0.4)' };
    var _qCo = { word:'#c4b5fd', sentence:'#fbbf24', grammar:'#4ade80', mock:'#fca5a5' };
    var _qDe = { word:'只看单词选释义', sentence:'使用单词例句填空', grammar:'使用文法例句填空', mock:'全部类型混合出题' };
    var qt = s.quizType;
    if (btn) { btn.textContent = _qLabels[qt]; btn.style.background = _qBg[qt]; btn.style.borderColor = _qBd[qt]; btn.style.color = _qCo[qt]; }
    var desc = document.querySelector('#gm-root .gm-section:has([data-gm=toggle-quiztype]) + div');
    if (desc) desc.textContent = _qDe[qt];
    return;
  }
  
  if (action === 'start-climb') { Game.start(); return; }
  if (action === 'start-boxing') { window.GameBoxing.start(); return; }
  
  if (action === 'quick-start') {
    var s2 = _gmLoadSettings();
    s2.selLvls = ['N3'];
    s2.selCats = [];
    s2.lvlOn = true;
    s2.catOn = true;
    s2.quizType = 'word';
    s2.displayMode = 0;
    _gmSaveSettings();
    Game.start();
    return;
  }
}

function init() {
  cacheByLevel();
  _gmClearCache();
  initVoice();
  var container = document.getElementById('p-game');
  if (!container) return;
  
  var gm = _gmLoadSettings();
  var lvls = ['N5','N4','N3','N2','N1'];
  var cats = typeof ALL_CATEGORIES !== 'undefined' ? ALL_CATEGORIES : [];
  
  var _dm = gm.displayMode || 0;
  var _dmBg = ['rgba(168,85,247,0.15)','rgba(251,191,36,0.15)','rgba(52,211,153,0.15)'][_dm];
  var _dmBd = ['rgba(168,85,247,0.4)','rgba(251,191,36,0.4)','rgba(52,211,153,0.4)'][_dm];
  var _dmCo = ['#c4b5fd','#fbbf24','#4ade80'][_dm];
  var _dmLb = ['📖 汉字大','🔊 假名大','🎧 仅假名'][_dm];
  var _dmDe = ['日本汉字大 / 平假名小','平假名大 / 日本汉字小','只显示平假名（发音）'][_dm];
  
  var _qt = gm.quizType || 'word';
  var _qtOrder = ['word','sentence','grammar','mock'];
  var _qtLabels = { word:'单词', sentence:'例句', grammar:'文法例句', mock:'模拟试题' };
  var _qtColors = { word:'rgba(168,85,247,0.15)', sentence:'rgba(251,191,36,0.15)', grammar:'rgba(52,211,153,0.15)', mock:'rgba(239,68,68,0.15)' };
  var _qtBdColors = { word:'rgba(168,85,247,0.4)', sentence:'rgba(251,191,36,0.4)', grammar:'rgba(52,211,153,0.4)', mock:'rgba(239,68,68,0.4)' };
  var _qtTextColors = { word:'#c4b5fd', sentence:'#fbbf24', grammar:'#4ade80', mock:'#fca5a5' };
  var _qtDescs = { word:'只看单词选释义', sentence:'使用单词例句填空', grammar:'使用文法例句填空', mock:'全部类型混合出题' };
  
  var html = '';
  // style
  html += '<style>';
  html += '  @keyframes gmFadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }';
  html += '  @keyframes gmPulse { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0.4)} 50%{box-shadow:0 0 0 12px rgba(168,85,247,0)} }';
  html += '  .gm-title { font-size:22px; font-weight:800; letter-spacing:2px; margin-bottom:4px; }';
  html += '  .gm-sub { font-size:12px; color:#64748b; margin-bottom:16px; }';
  html += '  .gm-card { background:linear-gradient(135deg,#1a1a3e,#0f3460); border-radius:16px; padding:24px 16px; cursor:pointer; text-align:center; transition:all 0.3s; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.06); }';
  html += '  .gm-card:hover { transform:translateY(-4px); box-shadow:0 8px 30px rgba(168,85,247,0.15); }';
  html += '  .gm-card-icon { font-size:42px; display:block; margin-bottom:8px; }';
  html += '  .gm-card-title { font-size:18px; font-weight:700; margin-bottom:4px; }';
  html += '  .gm-card-desc { font-size:11px; color:#64748b; line-height:1.6; }';
  html += '  .gm-card-climb { border-color:rgba(168,85,247,0.3); }';
  html += '  .gm-card-climb .gm-card-title { background:linear-gradient(135deg,#a855f7,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }';
  html += '  .gm-card-slogan { font-size:13px; font-weight:700; margin-bottom:4px; letter-spacing:1px; opacity:0.9; }';
  html += '  .gm-card-climb .gm-card-slogan { color:#fbbf24; text-shadow:0 0 10px rgba(251,191,36,0.3); }';
  html += '  .gm-card-boxing .gm-card-slogan { color:#ef4444; text-shadow:0 0 10px rgba(239,68,68,0.3); }';
  html += '  .gm-card-boxing { border-color:rgba(239,68,68,0.3); }';
  html += '  .gm-card-boxing .gm-card-title { background:linear-gradient(135deg,#ef4444,#fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }';
  html += '  .gm-quickstart { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; max-width:340px; padding:14px 20px; border:none; border-radius:14px; background:linear-gradient(135deg,#a855f7,#7c3aed); color:#fff; font-size:16px; font-weight:700; cursor:pointer; margin-bottom:14px; animation:gmPulse 2s infinite; transition:transform 0.15s,box-shadow 0.15s; }';
  html += '  .gm-quickstart:hover { transform:translateY(-2px); box-shadow:0 6px 25px rgba(168,85,247,0.35); }';
  html += '  .gm-quickstart:active { transform:translateY(0); }';
  html += '  .gm-section { padding:12px 14px; background:rgba(255,255,255,0.03); border-radius:12px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.06); }';
  html += '  .gm-checkbox { font-size:16px; cursor:pointer; user-select:none; }';
  html += '  .gm-checked { color:#e94560; }';
  html += '  .gm-tag { display:inline-block; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; background:rgba(255,255,255,0.06); color:#64748b; }';
  html += '  .gm-tag-on { background:linear-gradient(135deg,#e94560,#ff6b9d); color:#fff; }';
  html += '</style>';
  
  // 主容器
  html += '<div id="gm-root" style="display:flex;flex-direction:column;align-items:center;height:100%;padding:16px 20px;text-align:center;background:#0a0a18;overflow-y:auto">';
  html += '  <div style="font-size:34px;margin-bottom:4px">🎮</div>';
  html += '  <div class="gm-title" style="background:linear-gradient(135deg,#e94560,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">游戏模式</div>';
  html += '  <div class="gm-sub">先选单词范围和方式，再选游戏开始</div>';
  html += '  <button class="gm-quickstart" data-gm="quick-start">⚡ 快速开始 ｜ N3 · 爬塔闯关 · 默认配置</button>';
  
  // ---- 单词选择区 ----
  html += '  <div style="width:100%;max-width:340px;text-align:left;animation:gmFadeIn 0.3s ease-out both">';
  
  // 考级分类
  html += '  <div class="gm-section">';
  html += '    <div style="display:flex;justify-content:space-between;align-items:center">';
  html += '      <span data-gm="toggle-lvl-section" style="cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#e2e8f0">';
  html += '        <span class="gm-checkbox'+(gm.lvlOn?' gm-checked':'')+'" id="gm-cb-lvl">'+(gm.lvlOn?'☑':'☐')+'</span>🏷️ 考级分类</span>';
  html += '    </div>';
  html += '    <div id="gm-lvl-body" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;'+(gm.lvlOn?'':'opacity:0.35;pointer-events:none')+'">';
  lvls.forEach(function(l){var a=gm.selLvls.indexOf(l)>=0;html+='<span class="gm-tag'+(a?' gm-tag-on':'')+'" data-gm="toggle-lvl" data-lvl="'+l+'" style="background:'+(a?'linear-gradient(135deg,#e94560,#ff6b9d)':'rgba(255,255,255,0.06)')+';color:'+(a?'#fff':'#64748b')+'">'+l+'</span>';});
  html += '    </div>';
  html += '  </div>';
  
  // 场景分类
  html += '  <div class="gm-section">';
  html += '    <div style="display:flex;justify-content:space-between;align-items:center">';
  html += '      <span data-gm="toggle-cat-section" style="cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#e2e8f0">';
  html += '        <span class="gm-checkbox'+(gm.catOn?' gm-checked':'')+'" id="gm-cb-cat">'+(gm.catOn?'☑':'☐')+'</span>📂 场景分类</span>';
  html += '    </div>';
  html += '    <div id="gm-cat-body" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;max-height:140px;overflow-y:auto;'+(gm.catOn?'':'opacity:0.35;pointer-events:none')+'">';
  cats.forEach(function(c){var a=gm.selCats.indexOf(c)>=0;html+='<span class="gm-tag'+(a?' gm-tag-on':'')+'" data-gm="toggle-cat" data-cat="'+c.replace(/"/g,'&quot;')+'" style="background:'+(a?'linear-gradient(135deg,#e94560,#ff6b9d)':'rgba(255,255,255,0.06)')+';color:'+(a?'#fff':'#64748b')+'">'+c+'</span>';});
  html += '    </div>';
  html += '  </div>';
  
  // 显示方式切换
  html += '  <div class="gm-section" style="padding:8px 14px">';
  html += '    <div style="display:flex;justify-content:space-between;align-items:center">';
  html += '      <span style="font-size:12px;font-weight:600;color:#94a3b8">👁️ 显示方式</span>';
  html += '      <span data-gm="toggle-display" id="gm-display-btn" style="padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;background:'+_dmBg+';border:1px solid '+_dmBd+';color:'+_dmCo+'">'+_dmLb+'</span>';
  html += '    </div>';
  html += '    <div style="font-size:10px;color:#4a4a6a;margin-top:4px">'+_dmDe+'</div>';
  html += '  </div>';
  
  // 题库形式切换
  html += '  <div class="gm-section" style="padding:8px 14px">';
  html += '    <div style="display:flex;justify-content:space-between;align-items:center">';
  html += '      <span style="font-size:12px;font-weight:600;color:#94a3b8">📝 题库形式</span>';
  html += '      <span data-gm="toggle-quiztype" id="gm-quiztype-btn" style="padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;background:'+_qtColors[_qt]+';border:1px solid '+_qtBdColors[_qt]+';color:'+_qtTextColors[_qt]+'">'+_qtLabels[_qt]+'</span>';
  html += '    </div>';
  html += '    <div style="font-size:10px;color:#4a4a6a;margin-top:4px">'+_qtDescs[_qt]+'</div>';
  html += '  </div>';
  
  html += '  </div>'; // 结束单词选择区
  
  // ---- 游戏卡片 ----
  html += '  <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;animation:gmFadeIn 0.4s ease-out 0.15s both;margin-top:8px">';
  html += '    <div class="gm-card gm-card-climb" data-gm="start-climb">';
  html += '      <div class="gm-card-icon">🏔️</div>';
  html += '      <div class="gm-card-title">爬塔闯关</div>';
  html += '      <div class="gm-card-slogan">先上100层看看</div>';
  html += '      <div class="gm-card-desc">答对向上跳 · 答错摔下来<br>老师/家长/同事/课长 Boss 战</div>';
  html += '    </div>';
  html += '    <div class="gm-card gm-card-boxing" data-gm="start-boxing">';
  html += '      <div class="gm-card-icon">🥊</div>';
  html += '      <div class="gm-card-title">单词拳击</div>';
  html += '      <div class="gm-card-slogan">先拿个冠军看看</div>';
  html += '      <div class="gm-card-desc">第一人称视角 · 出拳KO对手<br>连击越高伤害越高</div>';
  html += '    </div>';
  html += '  </div>';
  
  html += '  <div style="margin-top:14px;font-size:10px;color:#3a3a5a">';
  html += '    爬塔最高层: '+(localStorage.getItem('tower_high_floor')||'无')+' | 拳击最高分: '+(localStorage.getItem('bx_high_score')||'无');
  html += '  </div>';
  html += '</div>';
  
  container.innerHTML = html;
  
  // 事件委托：所有点击由 gm-root 统一处理
  var root = document.getElementById('gm-root');
  if (root) {
    // 移除旧监听器以避免重复
    var oldHandler = root._gmHandler;
    if (oldHandler) root.removeEventListener('click', oldHandler);
    root.addEventListener('click', _gmHandleClick);
    root._gmHandler = _gmHandleClick;
  }
}

// 爬塔原有初始化内容移到 showTowerClimb
function showTowerClimb() {
  const container = document.getElementById('p-game');
  if (!container) return;
  
  container.innerHTML = `
    <style>
      @keyframes screenShake {
        0% { transform:translateX(0) }
        20% { transform:translateX(-5px) }
        40% { transform:translateX(5px) }
        60% { transform:translateX(-4px) }
        80% { transform:translateX(3px) }
        100% { transform:translateX(0) }
      }
      @keyframes shake {
        0%,100% { transform:translateX(0) }
        20% { transform:translateX(-5px) }
        40% { transform:translateX(5px) }
        60% { transform:translateX(-4px) }
        80% { transform:translateX(4px) }
      }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes bounceIn {
        0% { transform:scale(0.3); opacity:0 }
        50% { transform:scale(1.15) }
        70% { transform:scale(0.9) }
        100% { transform:scale(1); opacity:1 }
      }
      @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      @keyframes comboPop {
        0% { transform:translateX(-50%) scale(0.5); opacity:0 }
        50% { transform:translateX(-50%) scale(1.3) }
        100% { transform:translateX(-50%) scale(1); opacity:1 }
      }
      @keyframes floatTextUp {
        0% { opacity:1; transform:translate(-50%,-50%) scale(0.5) }
        30% { opacity:1; transform:translate(-50%,-60%) scale(1.2) }
        60% { opacity:0.8; transform:translate(-50%,-80%) scale(1) }
        100% { opacity:0; transform:translate(-50%,-120%) scale(0.8) }
      }
      @keyframes celebFadeIn {
        0% { opacity:0; }
        100% { opacity:1; }
      }
      @keyframes celebScale {
        0% { transform:scale(0.3); opacity:0; }
        50% { transform:scale(1.1); }
        100% { transform:scale(1); opacity:1; }
      }
      @keyframes celebPulse {
        0%,100% { box-shadow:0 0 20px rgba(168,85,247,0.3), 0 0 60px rgba(168,85,247,0.1); }
        50% { box-shadow:0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(168,85,247,0.2); }
      }
      /* ===== 小人物 CSS ===== */
      .game-char { position:relative; width:26px; height:46px; display:inline-block; }
      .gc-head {
        position:absolute; top:0; left:50%; transform:translateX(-50%);
        width:14px; height:14px; border-radius:50%;
        box-shadow:0 0 8px rgba(251,191,36,0.4);
        transition:all 0.2s;
      }
      /* 学生头：金色 */
      .game-char.student .gc-head { background:linear-gradient(135deg,#fcd34d,#f59e0b); }
      /* 社畜头：肤色偏白 */
      .game-char.office .gc-head { background:linear-gradient(135deg,#fde68a,#fcd34d); }
      
      .gc-body {
        position:absolute; top:13px; left:50%; transform:translateX(-50%);
        width:3px; height:14px; border-radius:2px;
        transition:all 0.2s;
      }
      /* 学生身体：亮色 */
      .game-char.student .gc-body { background:linear-gradient(180deg,#60a5fa,#3b82f6); }
      /* 社畜身体：西装深色 */
      .game-char.office .gc-body { background:linear-gradient(180deg,#475569,#1e293b); width:4px; }
      
      /* 学生背包 */
      .gc-backpack {
        position:absolute; top:15px; right:-5px;
        width:6px; height:10px; border-radius:3px 1px 1px 3px;
        background:linear-gradient(180deg,#34d399,#10b981);
        z-index:-1; transition:all 0.2s;
      }
      
      /* 社畜领带 */
      .gc-tie {
        position:absolute; top:14px; left:50%; transform:translateX(-50%);
        width:2px; height:8px;
        background:#ef4444;
        border-radius:0 0 1px 1px; z-index:1;
      }
      
      .gc-arm {
        position:absolute; top:15px;
        width:9px; height:2.5px; border-radius:2px;
        transform-origin:center center;
        transition:all 0.2s;
      }
      .game-char.student .gc-arm { background:#60a5fa; }
      .game-char.office .gc-arm { background:#475569; }
      .gc-arm.l { left:3px; transform:rotate(-30deg); }
      .gc-arm.r { right:3px; transform:rotate(30deg); }
      .gc-leg {
        position:absolute; top:26px;
        width:2.5px; height:10px; border-radius:2px;
        transition:all 0.2s;
      }
      .game-char.student .gc-leg { background:#60a5fa; }
      .game-char.office .gc-leg { background:#475569; }
      .gc-leg.l { left:9px; transform:rotate(-15deg); }
      .gc-leg.r { right:9px; transform:rotate(15deg); }
      /* 跳跃时手脚张开 */
      .game-char.jump .gc-arm.l { transform:rotate(-50deg); }
      .game-char.jump .gc-arm.r { transform:rotate(50deg); }
      .game-char.jump .gc-leg.l { transform:rotate(-30deg); }
      .game-char.jump .gc-leg.r { transform:rotate(30deg); }
      .game-char.jump .gc-head { transform:translateX(-50%) scale(1.1); }
      /* 摔落时压扁 */
      .game-char.fall .gc-head { transform:translateX(-50%) scale(1.2,0.8); }
      .game-char.fall .gc-body { transform:translateX(-50%) scale(1,0.6); }
    </style>
    <div style="display:flex;flex-direction:column;flex:1;position:relative">
      <div style="display:flex;justify-content:space-between;padding:7px 14px;background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;font-size:12px;z-index:10">
        <span id="gh-hud-floor">🏔️ 1F</span>
        <span id="gh-hud-hp">❤️❤️❤️❤️❤️</span>
        <span id="gh-heal-progress" style="font-size:11px;transition:all 0.3s;color:#64748b">💊 --</span>
        <span id="gh-hud-score">🎯 0</span>
      </div>
      <div id="gh-floor-counter-big" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:96px;font-weight:900;color:rgba(168,85,247,0.10);pointer-events:none;z-index:2;text-shadow:0 0 40px rgba(168,85,247,0.08);line-height:1;font-family:var(--font-en);transition:all 0.4s">1</div>
      <div id="gh-world" style="flex:1;overflow:hidden">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px">
          <div style="font-size:40px;margin-bottom:8px;animation:bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1)">🏔️</div>
          <div style="font-size:18px;font-weight:700;color:#e2e8f0">爬塔挑战 · 是男人就上100层</div>
          <div style="font-size:12px;color:#94a3b8;margin:8px 0;text-align:center;line-height:1.9">
            答对 <span style="color:#22c55e">⬆ 向上跳</span> · 答错 <span style="color:#ef4444">⬇ 摔落</span><br>
            <span style="color:#4ade80">💊 4~8 连击触发回血机会</span><br>
            <span style="color:#60a5fa">👨‍🎓 1~50F 学生时代</span> · <span style="color:#475569">👔 51~100F 社畜时代</span><br>
            <span style="color:#ef4444">👨‍🏫 遇到老师/家长 · 同事/课长/社长</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;justify-content:center">
            <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(168,85,247,0.1);color:#a78bfa">N5→N1</span>
            <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(251,191,36,0.1);color:#fbbf24">连击加成</span>
            <span style="font-size:10px;padding:3px 10px;border-radius:10px;background:rgba(34,197,94,0.1);color:#4ade80">限时答题</span>
          </div>
          <!-- 词库选择 -->
          <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;justify-content:center">
            <label style="font-size:11px;color:#94a3b8;padding:4px 10px;border-radius:10px;border:1px solid rgba(100,116,139,0.2);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px" class="gh-level-label" data-level="N5">
              <input type="checkbox" class="gh-level-cb" value="N5" checked style="accent-color:#a855f7;width:12px;height:12px"> N5
            </label>
            <label style="font-size:11px;color:#94a3b8;padding:4px 10px;border-radius:10px;border:1px solid rgba(100,116,139,0.2);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px" class="gh-level-label" data-level="N4">
              <input type="checkbox" class="gh-level-cb" value="N4" checked style="accent-color:#a855f7;width:12px;height:12px"> N4
            </label>
            <label style="font-size:11px;color:#94a3b8;padding:4px 10px;border-radius:10px;border:1px solid rgba(100,116,139,0.2);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px" class="gh-level-label" data-level="N3">
              <input type="checkbox" class="gh-level-cb" value="N3" checked style="accent-color:#a855f7;width:12px;height:12px"> N3
            </label>
            <label style="font-size:11px;color:#94a3b8;padding:4px 10px;border-radius:10px;border:1px solid rgba(100,116,139,0.2);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px" class="gh-level-label" data-level="N2">
              <input type="checkbox" class="gh-level-cb" value="N2" checked style="accent-color:#a855f7;width:12px;height:12px"> N2
            </label>
            <label style="font-size:11px;color:#94a3b8;padding:4px 10px;border-radius:10px;border:1px solid rgba(100,116,139,0.2);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px" class="gh-level-label" data-level="N1">
              <input type="checkbox" class="gh-level-cb" value="N1" checked style="accent-color:#a855f7;width:12px;height:12px"> N1
            </label>
          </div>
          <!-- 答题模式选择 -->
          <div style="display:flex;gap:8px;margin-top:10px">
            <button id="gh-mode-word" data-mode="word" style="padding:8px 16px;border-radius:14px;border:2px solid rgba(168,85,247,0.5);background:rgba(168,85,247,0.15);color:#c4b5fd;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;min-width:90px">
              🔤 单词模式
            </button>
            <button id="gh-mode-sentence" data-mode="sentence" style="padding:8px 16px;border-radius:14px;border:2px solid rgba(100,116,139,0.3);background:rgba(100,116,139,0.08);color:#94a3b8;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;min-width:90px">
              📖 例句模式
            </button>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
            <button id="gh-start-btn" style="padding:12px 32px;border-radius:24px;border:none;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 24px rgba(168,85,247,0.3);transition:all 0.2s">开始挑战</button>
            <button id="gh-wrong-book-btn" style="padding:12px 16px;border-radius:24px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:#f87171;font-size:13px;cursor:pointer;transition:all 0.2s">📖 生词本</button>
          </div>
        </div>
      </div>
      <div id="gh-quiz" style="flex-shrink:0;background:linear-gradient(180deg,#0f0f23,#1a1a3e);border-top:1px solid rgba(168,85,247,0.12);min-height:140px"></div>
    </div>
  `;
  
  el.gameWorld = document.getElementById('gh-world');
  el.quizArea = document.getElementById('gh-quiz');
  el.hudFloor = document.getElementById('gh-hud-floor');
  el.hudHp = document.getElementById('gh-hud-hp');
  el.hudScore = document.getElementById('gh-hud-score');
  el.floorCounterBig = document.getElementById('gh-floor-counter-big');
  
  document.getElementById('gh-start-btn')?.addEventListener('click', start);
  
  const btn = document.getElementById('gh-start-btn');
  if (btn) {
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 6px 30px rgba(168,85,247,0.5)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; btn.style.boxShadow = ''; });
  }
  
  // 词库选择：checkbox 切换
  document.querySelectorAll('.gh-level-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = [];
      document.querySelectorAll('.gh-level-cb:checked').forEach(c => checked.push(c.value));
      state.selectedLevels = checked.length > 0 ? checked : ['N5'];
      // 没有选中时保留 N5 防止无词
      if (checked.length === 0) {
        document.querySelector('.gh-level-cb[value="N5"]').checked = true;
        state.selectedLevels = ['N5'];
      }
    });
  });
  
  // 生词本按钮
  document.getElementById('gh-wrong-book-btn')?.addEventListener('click', showWrongBook);
  const wbBtn = document.getElementById('gh-wrong-book-btn');
  if (wbBtn) {
    wbBtn.addEventListener('mouseenter', () => { wbBtn.style.background = 'rgba(248,113,113,0.15)'; });
    wbBtn.addEventListener('mouseleave', () => { wbBtn.style.background = 'rgba(248,113,113,0.08)'; });
  }
  
  // 答题模式切换
  const modeBtns = {
    word: document.getElementById('gh-mode-word'),
    sentence: document.getElementById('gh-mode-sentence'),
  };
  
  function setMode(mode) {
    state.quizMode = mode;
    Object.keys(modeBtns).forEach(m => {
      const el = modeBtns[m];
      if (!el) return;
      const active = m === mode;
      el.style.borderColor = active ? 'rgba(168,85,247,0.5)' : 'rgba(100,116,139,0.3)';
      el.style.background = active ? 'rgba(168,85,247,0.15)' : 'rgba(100,116,139,0.08)';
      el.style.color = active ? '#c4b5fd' : '#94a3b8';
    });
  }
  
  Object.keys(modeBtns).forEach(m => {
    const el = modeBtns[m];
    if (!el) return;
    el.addEventListener('click', () => setMode(m));
    el.addEventListener('mouseenter', () => {
      if (state.quizMode !== m) {
        el.style.background = 'rgba(168,85,247,0.1)';
        el.style.borderColor = 'rgba(168,85,247,0.3)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (state.quizMode !== m) {
        el.style.background = 'rgba(100,116,139,0.08)';
        el.style.borderColor = 'rgba(100,116,139,0.3)';
      }
    });
  });
  
  setMode('word'); // 默认单词模式
}

function start() {
  // 🏯 进塔横幅
  (function(){try{
    var b=document.createElement('div');
    b.id='gmBanner';
    b.innerHTML='<span style="font-size:32px;margin-right:10px">🏯</span><span style="font-weight:800;font-size:18px">先上100层看看</span>';
    b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:8px;height:64px;background:linear-gradient(135deg,rgba(168,85,247,0.95),rgba(236,72,153,0.95));color:#fff;backdrop-filter:blur(8px);transform:translateY(-100%);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    document.body.appendChild(b);
    requestAnimationFrame(function(){b.style.transform='translateY(0)'});
    setTimeout(function(){b.style.transform='translateY(-100%)';setTimeout(function(){b.remove()},600)},3000);
  }catch(e){}})();
  try {
  // 从 localStorage 读取单词范围设置
  var gm = JSON.parse(localStorage.getItem('game_settings') || '{}');
  state.selectedLevels = gm.lvlOn !== false && gm.selLvls && gm.selLvls.length
    ? gm.selLvls.map(function(l){return l.toUpperCase().replace(/^N/,'N')})
    : ['N5','N4','N3','N2','N1'];
  state.selectedCategories = gm.catOn && gm.selCats && gm.selCats.length ? gm.selCats : [];
  state.displayMode = gm.displayMode !== undefined ? gm.displayMode : 0;
  state.quizType = gm.quizType || 'word';
  
  // 如果还没渲染爬塔界面（从游戏菜单启动），先渲染
  if (!document.getElementById('gh-world')) {
    showTowerClimb();
  }
  // 重置所有状态
  state.floor = 1; state.hp = MAX_HP; state.maxHp = MAX_HP;
  state.combo = 0; state.maxCombo = 0; state.score = 0;
  state.isPlaying = true; state.isBoss = false; state.bossProgress = 0; state.currentBossFloor = -1;
  state.wrongWords = []; state.answeredWords = 0; state.correctWords = 0;
  state.animating = false; state.animType = '';
  state.platformX = {};
  state.platformPosPct = {};
  initHealTarget();
  currentQuestion = null;
  
  const world = document.getElementById('gh-world');
  if (world) world.style.animation = '';
  
  renderWorld(state.floor);
  renderHUD();
  nextRound();
  } catch(e) { console.error('Game.start error:', e); }
}

window.Game = { init, start, showWrongBook, deleteWrongWord, clearWrongBook };

if (document.getElementById('p-game')) {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
}

})();
