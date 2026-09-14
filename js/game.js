// 게임 상태 관리 및 로직
(function (global) {
  const { BATTLE_FORMATS } = global.UI;

  function findFormat(key) {
    return BATTLE_FORMATS.find((f) => f.key === key) || BATTLE_FORMATS[0];
  }

  function createPanel(id) {
    return {
      id,
      score: 0,
      question: null,
      activeField: 'whole',
      inputs: { whole: '', num: '', den: '' },
      feedback: null,
      locked: false,
      lockRemaining: 0,
    };
  }

  function createInitialState() {
    return {
      screen: 'setup',
      config: {
        formatKey: 'ind2',
        mode: 'individual',
        count: 2,
        solveSeconds: 60,
        switchEnabled: false,
        switchSeconds: 10,
        category: 7,
      },
      panels: [],
      timeRemaining: 0,
      ended: false,
    };
  }

  const state = createInitialState();
  let tickHandle = null;

  function newQuestionFor(panel) {
    panel.question = global.QuestionBank.generateQuestion(state.config.category);
    panel.inputs = { whole: '', num: '', den: '' };
    panel.activeField = 'whole';
    panel.feedback = null;
  }

  function setFormat(key) {
    const f = findFormat(key);
    state.config.formatKey = key;
    state.config.mode = f.mode;
    state.config.count = f.count;
  }

  function setSolveSeconds(seconds) {
    state.config.solveSeconds = seconds;
  }

  function setSwitchEnabled(enabled) {
    state.config.switchEnabled = enabled;
  }

  function setSwitchSeconds(seconds) {
    state.config.switchSeconds = seconds;
  }

  function setCategory(cat) {
    state.config.category = cat;
  }

  function startGame() {
    state.panels = [];
    for (let i = 0; i < state.config.count; i++) {
      const panel = createPanel(i);
      newQuestionFor(panel);
      state.panels.push(panel);
    }
    state.timeRemaining = state.config.solveSeconds;
    state.ended = false;
    state.screen = 'battle';
    startTicking();
  }

  function startTicking() {
    stopTicking();
    tickHandle = setInterval(tick, 1000);
  }

  function stopTicking() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  function tick() {
    if (state.ended) return;
    state.timeRemaining -= 1;

    state.panels.forEach((panel) => {
      if (panel.locked) {
        panel.lockRemaining -= 1;
        if (panel.lockRemaining <= 0) {
          panel.locked = false;
          newQuestionFor(panel);
        }
      }
    });

    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      endGame();
      return;
    }
    global.render();
  }

  function endGame() {
    state.ended = true;
    stopTicking();
    state.screen = 'result';
    global.render();
  }

  function selectField(panelId, field) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    panel.activeField = field;
    global.render();
  }

  function cycleField(panelId) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    const order = ['whole', 'den', 'num'];
    const idx = order.indexOf(panel.activeField);
    panel.activeField = order[(idx + 1) % order.length];
    global.render();
  }

  function inputDigit(panelId, digit) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    const field = panel.activeField;
    const current = panel.inputs[field];
    if (current.length >= 2) return;
    panel.inputs[field] = current + String(digit);
    global.render();
  }

  function backspace(panelId) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    const field = panel.activeField;
    panel.inputs[field] = panel.inputs[field].slice(0, -1);
    global.render();
  }

  function clearAll(panelId) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    panel.inputs = { whole: '', num: '', den: '' };
    global.render();
  }

  function submitAnswer(panelId) {
    const panel = state.panels[panelId];
    if (!panel || panel.locked) return;
    const whole = parseInt(panel.inputs.whole || '0', 10);
    const num = parseInt(panel.inputs.num || '0', 10);
    const den = parseInt(panel.inputs.den || '0', 10);
    const ans = panel.question.answer;

    const correct = whole === ans.whole && num === ans.num && den === ans.den;

    if (correct) {
      panel.score += 1;
      panel.feedback = 'correct';
      if (global.GameAudio) global.GameAudio.playCorrectSfx();
      global.render();
      if (state.config.switchEnabled) {
        panel.locked = true;
        panel.lockRemaining = state.config.switchSeconds;
        global.render();
      } else {
        newQuestionFor(panel);
        global.render();
      }
    } else {
      panel.feedback = 'wrong';
      global.render();
      setTimeout(() => {
        panel.feedback = null;
        panel.inputs = { whole: '', num: '', den: '' };
        panel.activeField = 'whole';
        global.render();
      }, 500);
    }
  }

  function restart() {
    stopTicking();
    state.screen = 'setup';
    state.panels = [];
    state.ended = false;
    global.render();
  }

  global.Game = {
    state,
    setFormat,
    setSolveSeconds,
    setSwitchEnabled,
    setSwitchSeconds,
    setCategory,
    startGame,
    endGame,
    selectField,
    cycleField,
    inputDigit,
    backspace,
    clearAll,
    submitAnswer,
    restart,
  };
})(window);
