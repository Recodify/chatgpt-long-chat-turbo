// ==UserScript==
// @name         ChatGPT Auto Trim Old Turns
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Keeps only the most recent chat turns mounted in the DOM to reduce ChatGPT UI lag.
// @match        https://chatgpt.com/*
// @match        https://*.chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const CONFIG = {
    keepLast: 12,              // number of most recent turns to keep
    trimDebounceMs: 250,
    showBadge: true,
    logToConsole: false,
    preservePinnedUI: true,    // tries to avoid touching non-turn articles

    // ASCII animation options:
    // - set to false to disable all animation output
    enableTrimAnimation: true,
    // - options: cyberpunk-terminal | retro-arcade | orbital-launch | matrix-rain | robot-factory
    trimAnimationTheme: 'cyberpunk-terminal',
    // - 0 means use all theme frames, >0 caps frame count for quieter output
    trimAnimationFrameLimit: 0,
    // - minimum gap between animations to avoid spam during rapid mutations
    trimAnimationCooldownMs: 900
  };

  const TRIM_ANIMATION_THEMES = Object.freeze({
    'cyberpunk-terminal': Object.freeze({
      introBanner: Object.freeze([
        '    ____      _                          _____             _     _____           _                  ____',
        '   / / /     | |                        /  __ \\ |         | |   |_   _|         | |                / / /',
        '  /_/_/_     | |     ___  _ __   __ _   | /  \\/ |__   __ _| |_    | |_   _ _ __ | |__   ___       /_/_/_',
        '   / / /     | |    / _ \\| \'_ \\ / _` |  | |   | |_ \\ / _` | __|   | | | | | \'__ | \'_ \\ / _ \\       / / /',
        '   /_/_/     | |___| (_) | | | | |_| |  | \\__/\\ | | | (_| | |_    | | |_| | |   | |_) | (_) |     /_/_/',
        '    / /      \\_____/\\___/|_| |_|\\__  |   \\____/ | |_|\\__,_|\\__|   \\_/\\__,_|_|   |_.__/ \\___/       / /',
        '   /_/                           _/ _/                                                            /_/'
      ]),
      frames: Object.freeze([
        '[SYS] boot trim-core  [#.........] 09%',
        '[SYS] sync dom index  [###.......] 27%',
        '[SYS] map old turns   [#####.....] 45%',
        '[SYS] cut stale nodes [#######...] 63%',
        '[SYS] patch flow      [#########.] 81%',
        '[NET] trim pulse stable // no lag spikes'
      ]),
      completionBanner: Object.freeze([
        'TRIM COMPLETE // DOM LIGHTENED',
        'STATUS: clean stream, fast render'
      ]),
      styles: Object.freeze({
        intro: 'color:#00ffd1;font-weight:700;',
        frame: 'color:#8af5ff;',
        completion: 'color:#00ff5f;font-weight:700;'
      }),
      frameDelayMs: 95
    }),
    'retro-arcade': Object.freeze({
      introBanner: Object.freeze([
        '===================================',
        '===        TRIM ARCADE         ===',
        '==================================='
      ]),
      frames: Object.freeze([
        '1UP 000120  STAGE 1  [=>        ]',
        '1UP 000360  STAGE 1  [===>      ]',
        '1UP 000600  STAGE 1  [=====>    ]',
        '1UP 000840  STAGE 1  [======>   ]',
        '1UP 001080  STAGE 1  [========> ]',
        '1UP 001200  STAGE 1  [=========>]'
      ]),
      completionBanner: Object.freeze([
        'LEVEL CLEAR: OLD TURNS ELIMINATED',
        'BONUS: +SPEED +RESPONSIVENESS'
      ]),
      styles: Object.freeze({
        intro: 'color:#ffd400;font-weight:700;',
        frame: 'color:#fffb8f;',
        completion: 'color:#7cff6b;font-weight:700;'
      }),
      frameDelayMs: 110
    }),
    'orbital-launch': Object.freeze({
      introBanner: Object.freeze([
        'MISSION: CHAT FLOW STABILIZATION',
        'PAYLOAD: LATENCY REDUCTION MODULE'
      ]),
      frames: Object.freeze([
        'T-06  trim vector calculated  [****......]',
        'T-05  stale turns targeted    [*****.....]',
        'T-04  release sequence armed  [******....]',
        'T-03  igniters hot            [*******...]',
        'T-02  thrust ramp             [********..]',
        'T-00  LIFTOFF                 [**********]'
      ]),
      completionBanner: Object.freeze([
        'ORBIT ACHIEVED // CHAT UI STABLE',
        'GROUND REPORT: smooth operations'
      ]),
      styles: Object.freeze({
        intro: 'color:#8fd3ff;font-weight:700;',
        frame: 'color:#c8e6ff;',
        completion: 'color:#8bffb1;font-weight:700;'
      }),
      frameDelayMs: 120
    }),
    'matrix-rain': Object.freeze({
      introBanner: Object.freeze([
        ':: ENTERING STREAM GRID ::',
        ':: LOCATING EXCESS TOKENS ::'
      ]),
      frames: Object.freeze([
        '0101101 1010110 0110101   probe .',
        '1010010 0101101 1101010   probe ..',
        '1101010 0110101 1010010   sweep .',
        '0010110 1101010 0101101   sweep ..',
        '0110101 1010010 0101101   trim .',
        '1101010 0101101 0110101   lock'
      ]),
      completionBanner: Object.freeze([
        'GRID CLEANED // SIGNAL CLARITY UP',
        'TRACE: obsolete turns removed'
      ]),
      styles: Object.freeze({
        intro: 'color:#64ff64;font-weight:700;',
        frame: 'color:#8cff8c;',
        completion: 'color:#baffba;font-weight:700;'
      }),
      frameDelayMs: 85
    }),
    'robot-factory': Object.freeze({
      introBanner: Object.freeze([
        '[FACTORY] line online',
        '[FACTORY] trim bots active'
      ]),
      frames: Object.freeze([
        'ARM-A >|---   ARM-B   [bin=      ]',
        'ARM-A   |>-   ARM-B   [bin===    ]',
        'ARM-A   --|>  ARM-B   [bin=====  ]',
        'ARM-A   -|>   ARM-B   [bin=======]',
        'ARM-A  |>--   ARM-B   [dispatch  ]'
      ]),
      completionBanner: Object.freeze([
        '[FACTORY] recycling done',
        '[FACTORY] chat conveyor optimized'
      ]),
      styles: Object.freeze({
        intro: 'color:#ffa85c;font-weight:700;',
        frame: 'color:#ffd5ab;',
        completion: 'color:#fff1d8;font-weight:700;'
      }),
      frameDelayMs: 120
    })
  });

  const DEFAULT_ANIMATION_THEME = 'cyberpunk-terminal';

  let observer = null;
  let trimTimer = null;
  let lastTrimmedCount = 0;
  let animationTimer = null;
  let lastAnimationAt = 0;

  function log(...args) {
    if (CONFIG.logToConsole) console.log('[chatgpt-trim]', ...args);
  }

  function getThread() {
    return document.querySelector('#thread');
  }

  function getTurnArticles() {
    const thread = getThread();
    if (!thread) return [];

    let nodes = [...thread.querySelectorAll('article[data-testid^="conversation-turn-"]')];

    if (CONFIG.preservePinnedUI) {
      nodes = nodes.filter((el) => !el.dataset.cgptTrimPlaceholder);
    }

    return nodes;
  }

  function ensureBadge() {
    if (!CONFIG.showBadge) return null;

    let badge = document.getElementById('cgpt-trim-badge');
    if (badge) return badge;

    badge = document.createElement('div');
    badge.id = 'cgpt-trim-badge';
    Object.assign(badge.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: '999999',
      padding: '6px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      lineHeight: '1',
      opacity: '0.75',
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      transition: 'opacity 0.2s ease'
    });
    badge.textContent = 'trim idle';
    document.body.appendChild(badge);
    return badge;
  }

  function setBadge(text) {
    const badge = ensureBadge();
    if (badge) badge.textContent = text;
  }

  function makePlaceholder(removedCount) {
    const el = document.createElement('div');
    el.dataset.cgptTrimPlaceholder = '1';
    Object.assign(el.style, {
      margin: '8px 0',
      padding: '6px 12px',
      fontSize: '12px',
      opacity: '0.6',
      borderRadius: '8px'
    });
    el.textContent = `[${removedCount} older turn${removedCount === 1 ? '' : 's'} trimmed locally]`;
    return el;
  }

  function normalizeAnimationThemeId(themeId) {
    if (typeof themeId !== 'string') return '';
    return themeId.trim().toLowerCase();
  }

  function getAnimationTheme(themeId) {
    const normalized = normalizeAnimationThemeId(themeId);
    return TRIM_ANIMATION_THEMES[normalized] || TRIM_ANIMATION_THEMES[DEFAULT_ANIMATION_THEME];
  }

  function listAnimationThemes() {
    return Object.keys(TRIM_ANIMATION_THEMES);
  }

  function stopTrimAnimation() {
    if (!animationTimer) return;
    clearInterval(animationTimer);
    animationTimer = null;
  }

  function playTrimAnimation(trimmedCount, visibleCount) {
    if (!CONFIG.enableTrimAnimation) return;

    const now = Date.now();
    if (now - lastAnimationAt < CONFIG.trimAnimationCooldownMs) {
      return;
    }

    const theme = getAnimationTheme(CONFIG.trimAnimationTheme);
    const frameLimit = Number(CONFIG.trimAnimationFrameLimit);
    const frames = Number.isFinite(frameLimit) && frameLimit > 0
      ? theme.frames.slice(0, Math.floor(frameLimit))
      : theme.frames;

    if (!frames.length) return;

    stopTrimAnimation();
    lastAnimationAt = now;

    console.log(`%c${theme.introBanner.join('\n')}`, theme.styles.intro);

    let frameIndex = 0;
    animationTimer = setInterval(() => {
      if (frameIndex >= frames.length) {
        stopTrimAnimation();
        console.log(`%c${theme.completionBanner.join('\n')}`, theme.styles.completion);
        console.log(
          `%c[trimmed:${trimmedCount}] [visible:${visibleCount}] [keep:${CONFIG.keepLast}]`,
          theme.styles.completion
        );
        return;
      }

      console.log(`%c${frames[frameIndex]}`, theme.styles.frame);
      frameIndex += 1;
    }, theme.frameDelayMs);
  }

  function trimNow() {
    const thread = getThread();
    if (!thread) {
      setBadge('no thread');
      return 0;
    }

    const articles = getTurnArticles();
    const excess = articles.length - CONFIG.keepLast;

    if (excess <= 0) {
      setBadge(`trim idle (${articles.length})`);
      return 0;
    }

    const toRemove = articles.slice(0, excess);

    // Remove old placeholder(s) first so we keep only one fresh marker.
    [...thread.querySelectorAll('[data-cgpt-trim-placeholder="1"]')].forEach((n) => n.remove());

    const placeholder = makePlaceholder(toRemove.length);
    const first = toRemove[0];
    if (first && first.parentNode) {
      first.parentNode.insertBefore(placeholder, first);
    } else {
      thread.prepend(placeholder);
    }
    toRemove.forEach((n) => n.remove());

    lastTrimmedCount += toRemove.length;
    setBadge(`trimmed ${toRemove.length}, kept ${CONFIG.keepLast}`);
    log(`Trimmed ${toRemove.length}, kept ${CONFIG.keepLast}`);

    const visibleCount = Math.max(0, articles.length - toRemove.length);
    playTrimAnimation(toRemove.length, visibleCount);

    return toRemove.length;
  }

  function scheduleTrim() {
    clearTimeout(trimTimer);
    trimTimer = setTimeout(() => {
      try {
        trimNow();
      } catch (err) {
        console.error('[chatgpt-trim] trim failed:', err);
        setBadge('trim error');
      }
    }, CONFIG.trimDebounceMs);
  }

  function startObserver() {
    const thread = getThread();
    if (!thread) {
      setBadge('waiting for thread');
      return false;
    }

    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      scheduleTrim();
    });

    observer.observe(thread, {
      childList: true,
      subtree: true
    });

    setBadge(`watching, keep ${CONFIG.keepLast}`);
    log('Observer attached');
    scheduleTrim();
    return true;
  }

  function waitForThreadAndStart() {
    if (startObserver()) return;

    const bootObserver = new MutationObserver(() => {
      if (startObserver()) {
        bootObserver.disconnect();
      }
    });

    bootObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Expose a few helpers on window for manual control.
  window.trimChatNow = trimNow;
  window.trimChatStop = () => {
    if (observer) observer.disconnect();
    observer = null;
    stopTrimAnimation();
    setBadge('trim stopped');
    log('Observer stopped');
  };
  window.trimChatStart = () => {
    waitForThreadAndStart();
  };
  window.trimChatSetKeepLast = (n) => {
    const value = Number(n);
    if (!Number.isFinite(value) || value < 1) {
      throw new Error('keepLast must be a positive number');
    }
    CONFIG.keepLast = Math.floor(value);
    setBadge(`keep ${CONFIG.keepLast}`);
    scheduleTrim();
    return CONFIG.keepLast;
  };
  window.trimChatSetAnimationEnabled = (enabled) => {
    CONFIG.enableTrimAnimation = !!enabled;
    if (!CONFIG.enableTrimAnimation) {
      stopTrimAnimation();
    }
    return CONFIG.enableTrimAnimation;
  };
  window.trimChatSetAnimationTheme = (themeId) => {
    const normalized = normalizeAnimationThemeId(themeId);
    if (!TRIM_ANIMATION_THEMES[normalized]) {
      throw new Error(`Unknown animation theme: ${themeId}`);
    }
    CONFIG.trimAnimationTheme = normalized;
    return CONFIG.trimAnimationTheme;
  };
  window.trimChatListAnimationThemes = () => listAnimationThemes();
  window.trimChatStatus = () => ({
    keepLast: CONFIG.keepLast,
    observerActive: !!observer,
    totalTrimmedThisPage: lastTrimmedCount,
    animationEnabled: CONFIG.enableTrimAnimation,
    animationTheme: CONFIG.trimAnimationTheme,
    animationThemes: listAnimationThemes()
  });

  waitForThreadAndStart();
})();
