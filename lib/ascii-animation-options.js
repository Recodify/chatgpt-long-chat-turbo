(function initTrimAsciiThemes(globalScope) {
  'use strict';

  const DEFAULT_THEME_ID = 'cyberpunk-terminal';

  const THEMES = freezeThemes([
    {
      id: 'cyberpunk-terminal',
      name: 'Cyberpunk Terminal',
      description: 'Glitchy boot sequence with scanline-style progress.',
      frameDelayMs: 80,
      introBanner: [
        '    ____      _                          _____             _     _____           _                  ____',
        '   / / /     | |                        /  __ \\ |         | |   |_   _|         | |                / / /',
        '  /_/_/_     | |     ___  _ __   __ _   | /  \\/ |__   __ _| |_    | |_   _ _ __ | |__   ___       /_/_/_',
        '   / / /     | |    / _ \\| \'_ \\ / _` |  | |   | |_ \\ / _` | __|   | | | | | \'__ | \'_ \\ / _ \\       / / /',
        '   /_/_/     | |___| (_) | | | | |_| |  | \\__/\\ | | | (_| | |_    | | |_| | |   | |_) | (_) |     /_/_/',
        '    / /      \\_____/\\___/|_| |_|\\__  |   \\____/ | |_|\\__,_|\\__|   \\_/\\__,_|_|   |_.__/ \\___/       / /',
        '   /_/                           _/ _/                                                            /_/'
      ],
      frames: [
        '[SYS] boot trim-core  [#.........] 09%',
        '[SYS] boot trim-core  [##........] 18%',
        '[SYS] sync dom index  [###.......] 27%',
        '[SYS] sync dom index  [####......] 36%',
        '[SYS] map old turns   [#####.....] 45%',
        '[SYS] map old turns   [######....] 54%',
        '[SYS] cut stale nodes [#######...] 63%',
        '[SYS] cut stale nodes [########..] 72%',
        '[SYS] patch flow      [#########.] 81%',
        '[SYS] patch flow      [##########] 99%',
        '[NET] trim pulse stable // no lag spikes'
      ],
      completionBanner: [
        'TRIM COMPLETE // DOM LIGHTENED',
        'STATUS: clean stream, fast render'
      ],
      styles: {
        intro: 'color:#00ffd1;font-weight:700;',
        frame: 'color:#8af5ff;',
        completion: 'color:#00ff5f;font-weight:700;'
      }
    },
    {
      id: 'retro-arcade',
      name: 'Retro Arcade',
      description: 'Arcade HUD with score and level-up energy.',
      frameDelayMs: 95,
      introBanner: [
        '===================================',
        '===        TRIM ARCADE         ===',
        '==================================='
      ],
      frames: [
        '1UP 000120  STAGE 1  [>         ]',
        '1UP 000240  STAGE 1  [=>        ]',
        '1UP 000360  STAGE 1  [==>       ]',
        '1UP 000480  STAGE 1  [===>      ]',
        '1UP 000600  STAGE 1  [====>     ]',
        '1UP 000720  STAGE 1  [=====>    ]',
        '1UP 000840  STAGE 1  [======>   ]',
        '1UP 000960  STAGE 1  [=======>  ]',
        '1UP 001080  STAGE 1  [========> ]',
        '1UP 001200  STAGE 1  [=========>]'
      ],
      completionBanner: [
        'LEVEL CLEAR: OLD TURNS ELIMINATED',
        'BONUS: +SPEED +RESPONSIVENESS'
      ],
      styles: {
        intro: 'color:#ffd400;font-weight:700;',
        frame: 'color:#fffb8f;',
        completion: 'color:#7cff6b;font-weight:700;'
      }
    },
    {
      id: 'orbital-launch',
      name: 'Orbital Launch',
      description: 'Countdown and launch telemetry style animation.',
      frameDelayMs: 110,
      introBanner: [
        'MISSION: CHAT FLOW STABILIZATION',
        'PAYLOAD: LATENCY REDUCTION MODULE'
      ],
      frames: [
        'T-09  fuel pressure nominal   [*.........]',
        'T-08  core temp stable        [**........]',
        'T-07  nav lock engaged        [***.......]',
        'T-06  trim vector calculated  [****......]',
        'T-05  stale turns targeted    [*****.....]',
        'T-04  release sequence armed  [******....]',
        'T-03  igniters hot            [*******...]',
        'T-02  thrust ramp             [********..]',
        'T-01  full burn               [*********.]',
        'T-00  LIFTOFF                 [**********]'
      ],
      completionBanner: [
        'ORBIT ACHIEVED // CHAT UI STABLE',
        'GROUND REPORT: smooth operations'
      ],
      styles: {
        intro: 'color:#8fd3ff;font-weight:700;',
        frame: 'color:#c8e6ff;',
        completion: 'color:#8bffb1;font-weight:700;'
      }
    },
    {
      id: 'matrix-rain',
      name: 'Matrix Rain',
      description: 'Dense numeric stream with trim probe sweeps.',
      frameDelayMs: 70,
      introBanner: [
        ':: ENTERING STREAM GRID ::',
        ':: LOCATING EXCESS TOKENS ::'
      ],
      frames: [
        '0101101 1010110 0110101   probe .',
        '1010010 0101101 1101010   probe ..',
        '0110101 1010010 0010110   probe ...',
        '1101010 0110101 1010010   sweep .',
        '0010110 1101010 0101101   sweep ..',
        '1010010 0010110 1101010   sweep ...',
        '0110101 1010010 0101101   trim .',
        '0101101 0110101 1010010   trim ..',
        '1101010 0101101 0110101   trim ...',
        '0010110 1101010 1010010   lock'
      ],
      completionBanner: [
        'GRID CLEANED // SIGNAL CLARITY UP',
        'TRACE: obsolete turns removed'
      ],
      styles: {
        intro: 'color:#64ff64;font-weight:700;',
        frame: 'color:#8cff8c;',
        completion: 'color:#baffba;font-weight:700;'
      }
    },
    {
      id: 'robot-factory',
      name: 'Robot Factory',
      description: 'Assembly-line arms collecting and recycling old turns.',
      frameDelayMs: 100,
      introBanner: [
        '[FACTORY] line online',
        '[FACTORY] trim bots active'
      ],
      frames: [
        'ARM-A >|---   ARM-B   [bin       ]',
        'ARM-A  |>--   ARM-B   [bin=      ]',
        'ARM-A   |>-   ARM-B   [bin==     ]',
        'ARM-A   -|>   ARM-B   [bin===    ]',
        'ARM-A   --|>  ARM-B   [bin====   ]',
        'ARM-A   ---|> ARM-B   [bin=====  ]',
        'ARM-A   --|>  ARM-B   [bin====== ]',
        'ARM-A   -|>   ARM-B   [bin=======]',
        'ARM-A   |>-   ARM-B   [compact   ]',
        'ARM-A  |>--   ARM-B   [dispatch  ]'
      ],
      completionBanner: [
        '[FACTORY] recycling done',
        '[FACTORY] chat conveyor optimized'
      ],
      styles: {
        intro: 'color:#ffa85c;font-weight:700;',
        frame: 'color:#ffd5ab;',
        completion: 'color:#fff1d8;font-weight:700;'
      }
    }
  ]);

  function freezeThemes(themes) {
    return Object.freeze(
      themes.map((theme) =>
        Object.freeze({
          ...theme,
          introBanner: Object.freeze(theme.introBanner.slice()),
          frames: Object.freeze(theme.frames.slice()),
          completionBanner: Object.freeze(theme.completionBanner.slice()),
          styles: Object.freeze({ ...theme.styles })
        })
      )
    );
  }

  function cloneTheme(theme) {
    return {
      ...theme,
      introBanner: theme.introBanner.slice(),
      frames: theme.frames.slice(),
      completionBanner: theme.completionBanner.slice(),
      styles: { ...theme.styles }
    };
  }

  function listThemes() {
    return THEMES.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      frameDelayMs: theme.frameDelayMs,
      frameCount: theme.frames.length
    }));
  }

  function getTheme(themeId) {
    if (typeof themeId !== 'string' || !themeId.trim()) return null;
    const normalizedId = themeId.trim().toLowerCase();
    const found = THEMES.find((theme) => theme.id === normalizedId);
    return found ? cloneTheme(found) : null;
  }

  function pickTheme(themeId, fallbackThemeId) {
    const fallbackId = fallbackThemeId || DEFAULT_THEME_ID;
    return getTheme(themeId) || getTheme(fallbackId) || cloneTheme(THEMES[0]);
  }

  function getRandomTheme() {
    const index = Math.floor(Math.random() * THEMES.length);
    return cloneTheme(THEMES[index]);
  }

  function getDefaultTheme() {
    return pickTheme(DEFAULT_THEME_ID);
  }

  const api = Object.freeze({
    DEFAULT_THEME_ID,
    listThemes,
    getTheme,
    pickTheme,
    getRandomTheme,
    getDefaultTheme
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope && typeof globalScope === 'object') {
    globalScope.TrimAsciiThemes = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
