# ASCII Animation Options Library

`ascii-animation-options.js` exposes a small theme registry for console-based trim animations.

## Theme IDs
- `cyberpunk-terminal`
- `retro-arcade`
- `orbital-launch`
- `matrix-rain`
- `robot-factory`

## API
- `TrimAsciiThemes.listThemes()`
- `TrimAsciiThemes.getTheme(themeId)`
- `TrimAsciiThemes.pickTheme(themeId, fallbackThemeId)`
- `TrimAsciiThemes.getRandomTheme()`
- `TrimAsciiThemes.getDefaultTheme()`

Node/CommonJS also supported:

```js
const TrimAsciiThemes = require('./ascii-animation-options');
```

## Browser usage example

```js
const theme = TrimAsciiThemes.pickTheme('cyberpunk-terminal');
console.log(`%c${theme.introBanner.join('\n')}`, theme.styles.intro);

let index = 0;
const loop = setInterval(() => {
  if (index >= theme.frames.length) {
    clearInterval(loop);
    console.log(`%c${theme.completionBanner.join('\n')}`, theme.styles.completion);
    return;
  }
  console.log(`%c${theme.frames[index++]}`, theme.styles.frame);
}, theme.frameDelayMs);
```

## Suggested userscript integration
1. Add a config key: `asciiThemeId: 'cyberpunk-terminal'`.
2. Load the chosen theme once during startup.
3. Play a short animation only when `trimNow()` removes at least one turn.
4. Keep animation duration capped (for example <= 1.5s) to avoid noisy logs.
