// ==UserScript==
// @name         Recodify - Long Chat Turbo
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Keeps only the most recent chat turns mounted in the DOM to reduce ChatGPT UI lag.
// @match        https://chatgpt.com/*
// @match        https://*.chatgpt.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const CONFIG = {
    keepLast: 12,              // number of most recent turns to keep
    trimDebounceMs: 250,
    showBadge: true,
    logToConsole: false,
    preservePinnedUI: true,    // tries to avoid touching non-turn articles
    // remove old turns in chunks to avoid long main-thread blocks on huge chats
    trimChunkSize: 48,
    trimChunkDelayMs: 0,
    // suppress animation during initial heavy trim so first load stays responsive
    suppressAnimationDuringInitialTrim: true,

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
       "    ____      _                            _____               _     _____           _                  ____ ",
       "   / / /     | |                          /  __ \ |           | |   |_   _|         | |                / / / ",
       "  /_/_/_     | |     ___   _ __    __ _   | /  \/ |__    __ _ | |_    | |_   _ _ __ | |__   ___       /_/_/_ ",
       "   / / /     | |    / _ \ | '_ \  / _` |  | |   | |_ \  / _`  | __|   | | | | | '__ | '_ \ / _ \       / / / ",
       "   /_/_/     | |___| (_)  | | | |  |_| |  | \__/\ | | |  (_|  | |_    | | |_| | |   | |_) | (_) |     /_/_/  ",
       "    / /      \_____/\___/ |_| |_| \__  |   \____/ | |_| \__,_ |\__|   \_/\__,_|_|   |_.__/ \___/       / /   ",
       "   /_/                             _/ _/                                                              /_/    "
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
  let rootObserver = null;
  let observedThread = null;
  let trimTimer = null;
  let chunkTrimTimer = null;
  let lastTrimmedCount = 0;
  let animationTimer = null;
  let lastAnimationAt = 0;
  let chunkTrimActive = false;
  let chunkTrimRemovedTotal = 0;
  let pendingTrimAfterChunk = false;
  let initialTrimSettled = false;
  let lastAutoTrimAt = null;

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
    if (!document.body) return null;

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

  function formatAnimationElapsed(elapsedMs) {
    return `t+${Math.max(0, Math.floor(elapsedMs))}ms`;
  }

  function formatTimedAnimationFrame(frame, startedAt) {
    return `${frame}  ${formatAnimationElapsed(Date.now() - startedAt)}`;
  }

  function listAnimationThemes() {
    return Object.keys(TRIM_ANIMATION_THEMES);
  }

  function stopTrimAnimation() {
    if (!animationTimer) return;
    clearInterval(animationTimer);
    animationTimer = null;
  }

  function stopChunkTrim() {
    if (chunkTrimTimer) {
      clearTimeout(chunkTrimTimer);
      chunkTrimTimer = null;
    }
    chunkTrimActive = false;
    chunkTrimRemovedTotal = 0;
    pendingTrimAfterChunk = false;
  }

  function shouldSuppressAnimation() {
    return CONFIG.suppressAnimationDuringInitialTrim && !initialTrimSettled;
  }

  function applyTrimBatch(thread, toRemove, placeholderCount) {
    // Remove old placeholder(s) first so we keep only one fresh marker.
    [...thread.querySelectorAll('[data-cgpt-trim-placeholder="1"]')].forEach((n) => n.remove());

    const placeholder = makePlaceholder(placeholderCount);
    const first = toRemove[0];
    if (first && first.parentNode) {
      first.parentNode.insertBefore(placeholder, first);
    } else {
      thread.prepend(placeholder);
    }
    toRemove.forEach((n) => n.remove());
  }

  function finalizeChunkTrim(visibleCount) {
    const removed = chunkTrimRemovedTotal;
    const shouldAnimate = removed > 0 && !shouldSuppressAnimation();

    chunkTrimActive = false;
    chunkTrimRemovedTotal = 0;
    setBadge(`trim idle (${visibleCount})`);
    if (shouldAnimate) {
      playTrimAnimation(removed, visibleCount);
    }
    if (!initialTrimSettled) {
      initialTrimSettled = true;
    }

    if (pendingTrimAfterChunk) {
      pendingTrimAfterChunk = false;
      scheduleTrim(0);
    }
  }

  function runChunkTrimStep() {
    const thread = getThread();
    if (!thread) {
      stopChunkTrim();
      setBadge('no thread');
      return;
    }

    const articles = getTurnArticles();
    const excess = articles.length - CONFIG.keepLast;
    if (excess <= 0) {
      finalizeChunkTrim(articles.length);
      return;
    }

    const removeCount = Math.min(excess, Math.max(1, Math.floor(CONFIG.trimChunkSize)));
    const toRemove = articles.slice(0, removeCount);
    chunkTrimRemovedTotal += toRemove.length;
    lastTrimmedCount += toRemove.length;

    applyTrimBatch(thread, toRemove, chunkTrimRemovedTotal);
    setBadge(`trimming ${chunkTrimRemovedTotal}, keep ${CONFIG.keepLast}`);
    log(`Chunk trimmed ${toRemove.length} (total ${chunkTrimRemovedTotal})`);

    chunkTrimTimer = setTimeout(runChunkTrimStep, Math.max(0, Math.floor(CONFIG.trimChunkDelayMs)));
  }

  function startChunkTrim() {
    if (chunkTrimActive) return;
    chunkTrimActive = true;
    chunkTrimRemovedTotal = 0;
    runChunkTrimStep();
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
    const animationStartedAt = now;

    console.log(`%c${theme.introBanner.join('\n')}`, theme.styles.intro);

    let frameIndex = 0;
    animationTimer = setInterval(() => {
      if (frameIndex >= frames.length) {
        stopTrimAnimation();
        console.log(`%c${theme.completionBanner.join('\n')}`, theme.styles.completion);
        console.log(
          `%c[trimmed:${trimmedCount}] [visible:${visibleCount}] [keep:${CONFIG.keepLast}] [elapsed:${Math.max(0, Date.now() - animationStartedAt)}ms]`,
          theme.styles.completion
        );
        return;
      }

      console.log(`%c${formatTimedAnimationFrame(frames[frameIndex], animationStartedAt)}`, theme.styles.frame);
      frameIndex += 1;
    }, theme.frameDelayMs);
  }

  function trimNow() {
    if (chunkTrimActive) {
      pendingTrimAfterChunk = true;
      return 0;
    }

    const thread = getThread();
    if (!thread) {
      setBadge('no thread');
      return 0;
    }

    const articles = getTurnArticles();
    const excess = articles.length - CONFIG.keepLast;

    if (excess <= 0) {
      setBadge(`trim idle (${articles.length})`);
      if (!initialTrimSettled) {
        initialTrimSettled = true;
      }
      return 0;
    }

    const chunkSize = Math.max(1, Math.floor(CONFIG.trimChunkSize));
    if (excess > chunkSize) {
      startChunkTrim();
      return 0;
    }

    const toRemove = articles.slice(0, excess);
    applyTrimBatch(thread, toRemove, toRemove.length);

    lastTrimmedCount += toRemove.length;
    setBadge(`trimmed ${toRemove.length}, kept ${CONFIG.keepLast}`);
    log(`Trimmed ${toRemove.length}, kept ${CONFIG.keepLast}`);

    const visibleCount = Math.max(0, articles.length - toRemove.length);
    if (!shouldSuppressAnimation()) {
      playTrimAnimation(toRemove.length, visibleCount);
    }
    if (!initialTrimSettled) {
      initialTrimSettled = true;
    }

    return toRemove.length;
  }

  function scheduleTrim(delayOverrideMs) {
    if (chunkTrimActive) {
      pendingTrimAfterChunk = true;
      return;
    }

    clearTimeout(trimTimer);
    const delayMs = Number.isFinite(delayOverrideMs)
      ? Math.max(0, Math.floor(delayOverrideMs))
      : CONFIG.trimDebounceMs;

    trimTimer = setTimeout(() => {
      try {
        lastAutoTrimAt = new Date().toISOString();
        trimNow();
      } catch (err) {
        console.error('[chatgpt-trim] trim failed:', err);
        setBadge('trim error');
      }
    }, delayMs);
  }

  function startObserver() {
    const thread = getThread();
    if (!thread) {
      observedThread = null;
      setBadge('waiting for thread');
      return false;
    }

    if (observer && observedThread !== thread) {
      observer.disconnect();
      observer = null;
    }

    if (!observer) {
      observer = new MutationObserver(() => {
        scheduleTrim(initialTrimSettled ? CONFIG.trimDebounceMs : 30);
      });
    }

    observedThread = thread;

    observer.observe(observedThread, {
      childList: true,
      subtree: true
    });

    setBadge(`watching, keep ${CONFIG.keepLast}`);
    log('Observer attached');
    scheduleTrim(0);
    return true;
  }

  function startRootObserver() {
    if (rootObserver) return;

    const root = document.documentElement || document;
    rootObserver = new MutationObserver(() => {
      const currentThread = getThread();
      if (currentThread && currentThread !== observedThread) {
        log('Thread node changed, reattaching observer');
        startObserver();
      } else if (!currentThread && observedThread) {
        // Route switched or thread was replaced; wait for next attach.
        observedThread = null;
      }
    });

    rootObserver.observe(root, {
      childList: true,
      subtree: true
    });
  }

  function stopRootObserver() {
    if (!rootObserver) return;
    rootObserver.disconnect();
    rootObserver = null;
  }

  function waitForThreadAndStart() {
    startRootObserver();

    if (startObserver()) return;

    const bootObserver = new MutationObserver(() => {
      if (startObserver()) {
        bootObserver.disconnect();
      }
    });

    const bootRoot = document.documentElement || document;
    bootObserver.observe(bootRoot, {
      childList: true,
      subtree: true
    });

    // Race guard: if thread appeared between the first check and observe(),
    // try once more immediately.
    if (startObserver()) {
      bootObserver.disconnect();
      return;
    }

    // Ensure we retry once the initial DOM is parsed on very early startup.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (startObserver()) {
          bootObserver.disconnect();
        }
      }, { once: true });
    }
  }

  // Expose a few helpers on window for manual control.
  window.trimChatNow = trimNow;
  window.trimChatStop = () => {
    if (observer) observer.disconnect();
    observer = null;
    observedThread = null;
    stopRootObserver();
    stopChunkTrim();
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
    rootObserverActive: !!rootObserver,
    threadAttached: !!observedThread,
    totalTrimmedThisPage: lastTrimmedCount,
    chunkTrimActive,
    initialTrimSettled,
    lastAutoTrimAt,
    animationEnabled: CONFIG.enableTrimAnimation,
    animationTheme: CONFIG.trimAnimationTheme,
    animationThemes: listAnimationThemes()
  });

  waitForThreadAndStart();
})();
