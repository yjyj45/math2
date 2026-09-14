// Web Audio API로 직접 합성하는 배경음악 & 효과음 (외부 음원 파일 불필요)
(function (global) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = AudioCtx ? new AudioCtx() : null;

  let muted = false;
  let unlocked = false;
  let loopTimeoutId = null;
  let currentTrack = null;

  let masterGain, musicGain, sfxGain;
  if (ctx) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 1;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 1;
    sfxGain.connect(masterGain);
  }

  // C 장조 5음 음계(펜타토닉) - 불협화음 없이 편안한 느낌
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  };

  function playTone(freq, startTime, duration, opts) {
    if (!ctx) return;
    const { wave = 'sine', gain = 0.15, dest = musicGain } = opts || {};
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(g);
    g.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // 잔잔한 메인 화면 BGM - 느린 템포의 오르내리는 아르페지오
  const MAIN_PATTERN = {
    notes: [
      ['C4', 0, 1.8], ['E4', 1, 1.8], ['G4', 2, 1.8], ['A4', 3, 1.8],
      ['G4', 4, 1.8], ['E4', 5, 1.8], ['D4', 6, 1.8], ['C4', 7, 1.8],
    ],
    loopBeats: 8,
    beatSec: 0.5,
    wave: 'triangle',
    gain: 0.09,
  };

  // 은은한 게임 진행 BGM - 조금 더 리듬감 있지만 시끄럽지 않게
  const GAME_PATTERN = {
    notes: [
      ['C4', 0, 0.55], ['G4', 1, 0.55], ['E4', 2, 0.55], ['G4', 3, 0.55],
      ['D4', 4, 0.55], ['A4', 5, 0.55], ['E4', 6, 0.55], ['G4', 7, 0.55],
    ],
    loopBeats: 8,
    beatSec: 0.36,
    wave: 'sine',
    gain: 0.075,
  };

  function stopBGM() {
    if (loopTimeoutId) {
      clearTimeout(loopTimeoutId);
      loopTimeoutId = null;
    }
    currentTrack = null;
  }

  function playPattern(pattern) {
    if (!ctx || muted) return;
    function scheduleOnce() {
      const now = ctx.currentTime + 0.05;
      pattern.notes.forEach(([note, beat, dur]) => {
        playTone(NOTES[note], now + beat * pattern.beatSec, dur * pattern.beatSec, {
          wave: pattern.wave,
          gain: pattern.gain,
          dest: musicGain,
        });
      });
      loopTimeoutId = setTimeout(scheduleOnce, pattern.loopBeats * pattern.beatSec * 1000);
    }
    scheduleOnce();
  }

  function playMainBGM() {
    if (currentTrack === 'main') return;
    stopBGM();
    currentTrack = 'main';
    playPattern(MAIN_PATTERN);
  }

  function playGameBGM() {
    if (currentTrack === 'game') return;
    stopBGM();
    currentTrack = 'game';
    playPattern(GAME_PATTERN);
  }

  function playCorrectSfx() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    playTone(NOTES.C5, now, 0.11, { wave: 'square', gain: 0.18, dest: sfxGain });
    playTone(NOTES.E5, now + 0.08, 0.11, { wave: 'square', gain: 0.18, dest: sfxGain });
    playTone(NOTES.G5, now + 0.16, 0.2, { wave: 'square', gain: 0.2, dest: sfxGain });
  }

  function unlock() {
    if (unlocked || !ctx) return;
    unlocked = true;
    if (ctx.state === 'suspended') ctx.resume();
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      stopBGM();
    } else if (currentTrack === null && unlocked) {
      // 다시 켤 때는 main.js가 화면에 맞는 트랙을 재생하도록 위임
    }
    return muted;
  }

  function isMuted() {
    return muted;
  }

  function isUnlocked() {
    return unlocked;
  }

  global.GameAudio = {
    unlock,
    isUnlocked,
    playMainBGM,
    playGameBGM,
    stopBGM,
    playCorrectSfx,
    toggleMute,
    isMuted,
  };
})(window);
