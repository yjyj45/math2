// 화면 렌더링 (문자열 기반, innerHTML 갱신)
(function (global) {
  const BATTLE_FORMATS = [
    { key: 'ind2', mode: 'individual', count: 2, label: '2명 개인전' },
    { key: 'ind3', mode: 'individual', count: 3, label: '3명 개인전' },
    { key: 'ind4', mode: 'individual', count: 4, label: '4명 개인전' },
    { key: 'team2', mode: 'team', count: 2, label: '2팀전' },
    { key: 'team3', mode: 'team', count: 3, label: '3팀전' },
    { key: 'team4', mode: 'team', count: 4, label: '4팀전' },
  ];

  const TIME_OPTIONS = [
    { seconds: 60, label: '1분' },
    { seconds: 120, label: '2분' },
    { seconds: 180, label: '3분' },
  ];

  const SWITCH_SECONDS_OPTIONS = [10, 20, 30];

  const CATEGORY_OPTIONS = [
    { id: 1, label: '진분수 + 진분수' },
    { id: 2, label: '대분수 + 대분수' },
    { id: 3, label: '진분수 - 진분수, 1 - 진분수' },
    { id: 4, label: '받아내림이 없는 대분수 - 대분수' },
    { id: 5, label: '1보다 큰 자연수 - 대분수' },
    { id: 6, label: '대분수 - 대분수' },
    { id: 7, label: '전체 내용' },
  ];

  const INDIVIDUAL_THEMES = [
    { name: '강아지', icon: '🐶', itemIcon: '🦴', bg: '#4a4a1a' },
    { name: '고양이', icon: '🐱', itemIcon: '🐟', bg: '#241f3d' },
    { name: '토끼', icon: '🐰', itemIcon: '🥕', bg: '#3d1f22' },
    { name: '거북이', icon: '🐢', itemIcon: '🍀', bg: '#1f3d33' },
  ];

  const TEAM_THEMES = [
    { name: '1팀', icon: '🔵', itemIcon: '⭐', bg: '#1f3350' },
    { name: '2팀', icon: '🔴', itemIcon: '⭐', bg: '#3d1f22' },
    { name: '3팀', icon: '🟢', itemIcon: '⭐', bg: '#1f3d33' },
    { name: '4팀', icon: '🟡', itemIcon: '⭐', bg: '#4a3d1a' },
  ];

  function themesFor(config) {
    const list = config.mode === 'team' ? TEAM_THEMES : INDIVIDUAL_THEMES;
    return list.slice(0, config.count);
  }

  function escapeHtml(v) {
    return String(v);
  }

  function renderMuteButton(extraClass) {
    const muted = global.GameAudio && global.GameAudio.isMuted();
    return `<button class="mute-btn ${extraClass || ''}" data-action="toggle-mute" title="음악 켜기/끄기">${muted ? '🔇' : '🔊'}</button>`;
  }

  function renderOperand(op) {
    if (op.num === undefined) {
      return `<span class="whole-only">${escapeHtml(op.whole)}</span>`;
    }
    const wholePart = op.whole ? `<span class="mixed-whole">${escapeHtml(op.whole)}</span>` : '';
    return `${wholePart}<span class="fraction"><span class="num">${escapeHtml(op.num)}</span><span class="den">${escapeHtml(op.den)}</span></span>`;
  }

  function renderQuestion(q) {
    return `<div class="question">${renderOperand(q.left)}<span class="op">${q.op}</span>${renderOperand(q.right)}</div>`;
  }

  function medalFor(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  }

  function renderSetupScreen(config) {
    const formatButtons = BATTLE_FORMATS.map((f) => {
      const selected = config.formatKey === f.key ? 'selected' : '';
      return `<button class="option-btn ${selected}" data-action="select-format" data-key="${f.key}">${f.label}</button>`;
    }).join('');

    const timeButtons = TIME_OPTIONS.map((t) => {
      const selected = config.solveSeconds === t.seconds ? 'selected' : '';
      return `<button class="option-btn ${selected}" data-action="select-time" data-seconds="${t.seconds}">${t.label}</button>`;
    }).join('');

    const switchToggle = `
      <button class="option-btn ${!config.switchEnabled ? 'selected' : ''}" data-action="select-switch-mode" data-enabled="0">없음</button>
      <button class="option-btn ${config.switchEnabled ? 'selected' : ''}" data-action="select-switch-mode" data-enabled="1">있음</button>
    `;

    const switchSecondsRow = config.switchEnabled
      ? `<div class="option-row sub-row">${SWITCH_SECONDS_OPTIONS.map(
          (s) =>
            `<button class="option-btn ${config.switchSeconds === s ? 'selected' : ''}" data-action="select-switch-seconds" data-seconds="${s}">${s}초</button>`
        ).join('')}</div>`
      : '';

    const categoryButtons = CATEGORY_OPTIONS.map((c) => {
      const selected = config.category === c.id ? 'selected' : '';
      return `<button class="option-btn category-btn ${selected}" data-action="select-category" data-cat="${c.id}">${c.label}</button>`;
    }).join('');

    return `
      <div class="setup-screen">
        ${renderMuteButton('setup-mute-btn')}
        <h1 class="title">🍀 분수 배틀 퀴즈 🍀</h1>
        <p class="subtitle">4학년 1학기 · 분수의 덧셈과 뺄셈</p>

        <section class="setup-section">
          <h2>1. 배틀 형식</h2>
          <div class="option-row">${formatButtons}</div>
        </section>

        <section class="setup-section">
          <h2>2. 풀이 시간</h2>
          <div class="option-row">${timeButtons}</div>
        </section>

        <section class="setup-section">
          <h2>3. 교체시간</h2>
          <div class="option-row">${switchToggle}</div>
          ${switchSecondsRow}
        </section>

        <section class="setup-section">
          <h2>4. 출제범위</h2>
          <div class="option-row category-row">${categoryButtons}</div>
        </section>

        <button class="start-btn" data-action="start-game">게임 시작하기</button>
      </div>
    `;
  }

  function fieldContent(value, label) {
    return value ? `<span class="tab-value">${escapeHtml(value)}</span>` : `<span class="tab-label">${label}</span>`;
  }

  function renderPanel(panel, theme, rank) {
    const fb = panel.feedback ? ` feedback-${panel.feedback}` : '';
    const lockedOverlay = panel.locked
      ? `<div class="lock-overlay">정답! 🎉<br /><span class="lock-count">${panel.lockRemaining}초 후 다음 문제</span></div>`
      : '';
    return `
      <div class="panel${fb}" style="--panel-bg:${theme.bg}">
        <div class="panel-header">
          <span class="panel-icon">${theme.icon}</span>
          <span class="panel-name">${theme.name}</span>
        </div>
        <div class="panel-score">
          <span class="item-icon">${theme.itemIcon}</span><span class="score-num">${panel.score}</span>
        </div>
        <div class="panel-medal">${medalFor(rank)}</div>
        <div class="panel-question">${renderQuestion(panel.question)}</div>
        <div class="keypad ${panel.locked ? 'disabled' : ''}">
          <div class="keypad-tabs">
            <button class="tab ${panel.activeField === 'whole' ? 'active' : ''}" data-action="select-field" data-panel="${panel.id}" data-field="whole">${fieldContent(panel.inputs.whole, '자연수')}</button>
            <button class="tab ${panel.activeField === 'num' ? 'active' : ''}" data-action="select-field" data-panel="${panel.id}" data-field="num">${fieldContent(panel.inputs.num, '분자')}</button>
            <button class="tab ${panel.activeField === 'den' ? 'active' : ''}" data-action="select-field" data-panel="${panel.id}" data-field="den">${fieldContent(panel.inputs.den, '분모')}</button>
            <button class="clear-all-btn" data-action="keypad-clear" data-panel="${panel.id}" title="전체 지우기">⌦</button>
          </div>
          <div class="keypad-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9]
              .map((d) => `<button data-action="keypad-digit" data-panel="${panel.id}" data-digit="${d}">${d}</button>`)
              .join('')}
            <button class="erase-btn" data-action="keypad-backspace" data-panel="${panel.id}">지움</button>
            <button data-action="keypad-digit" data-panel="${panel.id}" data-digit="0">0</button>
            <button class="next-btn" data-action="keypad-next" data-panel="${panel.id}">다음</button>
          </div>
          <button class="submit-btn" data-action="submit-answer" data-panel="${panel.id}">제출</button>
        </div>
        ${lockedOverlay}
      </div>
    `;
  }

  function computeRanks(panels) {
    const sortedScores = [...panels.map((p) => p.score)].sort((a, b) => b - a);
    return panels.map((p) => sortedScores.indexOf(p.score) + 1);
  }

  function renderBattleScreen(state) {
    const themes = themesFor(state.config);
    const ranks = computeRanks(state.panels);
    const panelsHtml = state.panels
      .map((p, i) => renderPanel(p, themes[i], ranks[i]))
      .join('');
    const gridClass = state.panels.length === 4 ? 'panels grid-4' : 'panels';
    return `
      <div class="battle-screen">
        <div class="top-bar">
          ${renderMuteButton('battle-mute-btn')}
          <div class="timer">${state.timeRemaining}</div>
          <button class="end-btn" data-action="end-game">게임 종료</button>
        </div>
        <div class="${gridClass}">${panelsHtml}</div>
      </div>
    `;
  }

  function renderResultScreen(state) {
    const themes = themesFor(state.config);
    const rows = state.panels
      .map((p, i) => ({ panel: p, theme: themes[i] }))
      .sort((a, b) => b.panel.score - a.panel.score);
    const ranks = computeRanks(state.panels);
    const rankByPanelId = {};
    state.panels.forEach((p, i) => (rankByPanelId[p.id] = ranks[i]));

    const rowsHtml = rows
      .map(({ panel, theme }) => {
        const rank = rankByPanelId[panel.id];
        return `
          <div class="result-row rank-${rank <= 3 ? rank : 'other'}">
            <span class="result-medal">${medalFor(rank)}</span>
            <span class="result-icon">${theme.icon}</span>
            <span class="result-name">${theme.name}</span>
            <span class="result-score">${panel.score}점</span>
          </div>
        `;
      })
      .join('');

    return `
      <div class="result-screen">
        ${renderMuteButton('setup-mute-btn')}
        <h1 class="title">🏆 최종 결과 🏆</h1>
        <div class="result-list">${rowsHtml}</div>
        <button class="start-btn" data-action="restart">다시 하기</button>
      </div>
    `;
  }

  global.UI = {
    BATTLE_FORMATS,
    TIME_OPTIONS,
    SWITCH_SECONDS_OPTIONS,
    CATEGORY_OPTIONS,
    themesFor,
    renderSetupScreen,
    renderBattleScreen,
    renderResultScreen,
  };
})(window);
