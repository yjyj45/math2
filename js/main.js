// 진입점: 렌더링 & 이벤트 위임
(function (global) {
  const app = document.getElementById('app');

  function render() {
    const state = global.Game.state;
    if (state.screen === 'setup') {
      app.innerHTML = global.UI.renderSetupScreen(state.config);
    } else if (state.screen === 'battle') {
      app.innerHTML = global.UI.renderBattleScreen(state);
    } else if (state.screen === 'result') {
      app.innerHTML = global.UI.renderResultScreen(state);
    }
  }

  global.render = render;

  app.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const G = global.Game;
    const action = target.dataset.action;

    switch (action) {
      case 'select-format':
        G.setFormat(target.dataset.key);
        render();
        break;
      case 'select-time':
        G.setSolveSeconds(parseInt(target.dataset.seconds, 10));
        render();
        break;
      case 'select-switch-mode':
        G.setSwitchEnabled(target.dataset.enabled === '1');
        render();
        break;
      case 'select-switch-seconds':
        G.setSwitchSeconds(parseInt(target.dataset.seconds, 10));
        render();
        break;
      case 'select-category':
        G.setCategory(parseInt(target.dataset.cat, 10));
        render();
        break;
      case 'start-game':
        G.startGame();
        render();
        break;
      case 'select-field':
        G.selectField(parseInt(target.dataset.panel, 10), target.dataset.field);
        break;
      case 'keypad-digit':
        G.inputDigit(parseInt(target.dataset.panel, 10), target.dataset.digit);
        break;
      case 'keypad-backspace':
        G.backspace(parseInt(target.dataset.panel, 10));
        break;
      case 'keypad-clear':
        G.clearAll(parseInt(target.dataset.panel, 10));
        break;
      case 'keypad-next':
        G.cycleField(parseInt(target.dataset.panel, 10));
        break;
      case 'submit-answer':
        G.submitAnswer(parseInt(target.dataset.panel, 10));
        break;
      case 'end-game':
        if (confirm('게임을 종료하고 결과를 볼까요?')) {
          G.endGame();
        }
        break;
      case 'restart':
        G.restart();
        break;
      default:
        break;
    }
  });

  render();
})(window);
