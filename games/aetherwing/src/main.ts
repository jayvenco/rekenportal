import './style.css';
import { Game } from './core/Game';

const canvas = document.getElementById('stage') as HTMLCanvasElement | null;
const root = document.getElementById('app');

if (!canvas || !root) {
  throw new Error('Aetherwing: expected #stage and #app in the document.');
}

try {
  const game = new Game(canvas, root);
  // Handy for debugging from the console; harmless in production.
  (window as unknown as { aetherwing?: Game }).aetherwing = game;
} catch (error) {
  console.error(error);
  showFatal(error);
}

function showFatal(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const panel = document.createElement('div');
  panel.setAttribute(
    'style',
    [
      'position:fixed',
      'inset:0',
      'display:grid',
      'place-items:center',
      'padding:32px',
      'text-align:center',
      'background:#070b17',
      'color:#e8ecf6',
      'font:500 15px/1.6 ui-sans-serif,system-ui,sans-serif',
      'z-index:99',
    ].join(';'),
  );
  panel.innerHTML =
    '<div><h1 style="font-size:22px;letter-spacing:.2em;margin:0 0 12px">AETHERWING</h1>' +
    '<p style="margin:0 0 6px;color:#a8b3cf">This browser could not start the game.</p>' +
    `<p style="margin:0;color:#6c789a;font-size:13px">${escapeHtml(message)}</p></div>`;
  document.body.append(panel);
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
