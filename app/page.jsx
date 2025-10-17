// app/page.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const rafRef = useRef();

  const MESSAGE = 'Moin Juri!';
  const RAIN_COLOR = '#00ff9c';
  const BG_COLOR = '#0a0a0a';

  // Kürzerer Trail + klarerer Regen
  const TRAIL_ALPHA = 0.32;      // vorher 0.08 — höher = schnelleres Ausblenden
  const RAIN_OPACITY = 0.7;      // Regen etwas transparenter
  const PROB_FAST_MATCH = 0.25;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    const M = MESSAGE.length;
    const COLS = Math.max(1, M + 6);
    const MSG_START_COL = 3;

    let CELL = 18, ROWS = 0, centerRow = 0;
    let y = new Array(COLS).fill(0);
    let frozen = new Array(COLS).fill(false);
    let targetChar = new Array(COLS).fill(null);
    let frozenChar = new Array(COLS).fill(null);
    let glow = new Array(COLS).fill(0); // schnellerer Abbau im Draw

    const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join('');
    const rndChar = () => ASCII[(Math.random() * ASCII.length) | 0];

    const assignTargets = () => {
      targetChar.fill(null);
      for (let i = 0; i < M; i++) targetChar[MSG_START_COL + i] = MESSAGE[i];
    };

    const resetState = () => {
      y = new Array(COLS).fill(0).map(() => Math.floor(Math.random() * ROWS));
      frozen.fill(false);
      frozenChar.fill(null);
      glow.fill(0);
      assignTargets();
    };

    const resize = () => {
      const { innerWidth: w, innerHeight: h, devicePixelRatio: dpr = 1 } = window;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      CELL = Math.max(10, Math.floor(w / COLS));
      ROWS = Math.max(1, Math.floor(h / CELL));
      centerRow = Math.floor(ROWS / 2);

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resetState();
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      // Stärkeres Abdunkeln -> kürzerer Trail
      ctx.fillStyle = `rgba(10,10,10,${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fontPx = Math.floor(CELL * 0.9);
      ctx.font = `${fontPx}px monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      let allMsgFrozen = true;

      for (let c = 0; c < COLS; c++) {
        const x = c * CELL;

        if (!frozen[c]) {
          // Zeichenwahl
          let ch =
            targetChar[c] && y[c] === centerRow && Math.random() < PROB_FAST_MATCH
              ? targetChar[c]
              : rndChar();

          // Regen OHNE Schatten, leicht transparent
          const g = (glow[c] = Math.max(0, glow[c] - 0.12)); // schnellerer Glow-Abbau
          const alpha = g > 0 ? 0.4 + 0.6 * g : RAIN_OPACITY;
          ctx.fillStyle = `rgba(0,255,156,${alpha})`;
          const yPx = y[c] * CELL;
          ctx.fillText(ch, x, yPx);

          // Freeze bei Treffer
          if (targetChar[c] && y[c] === centerRow && ch === targetChar[c]) {
            frozen[c] = true;
            frozenChar[c] = ch;
            glow[c] = 1;
          } else {
            y[c]++;
            if (y[c] >= ROWS) y[c] = 0;
          }
        }

        // Eingefrorene Message-Zeichen mit Glow (Schatten nur hier)
        if (frozen[c] && targetChar[c]) {
          const yPx = centerRow * CELL;
          ctx.fillStyle = RAIN_COLOR;
          ctx.shadowColor = RAIN_COLOR;
          ctx.shadowBlur = 10;
          ctx.fillText(frozenChar[c], x, yPx);
          ctx.shadowBlur = 0;
        }

        if (targetChar[c] && !frozen[c]) allMsgFrozen = false;
      }

      if (allMsgFrozen) return; // kompletter Screen einfrieren
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main style={{ height: '100svh', width: '100vw', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} />
    </main>
  );
}
