// Read-only Deriv API check: authorize (which account? demo/real?) + pull a few
// frxXAUUSD M15 candles. No trades. Run: node scripts/deriv-check.mjs
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const TOKEN = process.env.DERIV_API_TOKEN;
const APP_ID = process.env.DERIV_APP_ID || '1089';
if (!TOKEN) { console.error('✗ DERIV_API_TOKEN missing in highzcore/.env.local'); process.exit(1); }

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);
let id = 1;
const pending = new Map();
function call(req) {
  return new Promise((res, rej) => {
    const req_id = id++;
    pending.set(req_id, { res, rej });
    ws.send(JSON.stringify({ ...req, req_id }));
    setTimeout(() => { if (pending.has(req_id)) { pending.delete(req_id); rej(new Error('timeout ' + Object.keys(req)[0])); } }, 15000);
  });
}
ws.onmessage = (ev) => {
  const m = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
  const p = pending.get(m.req_id);
  if (!p) return;
  pending.delete(m.req_id);
  if (m.error) p.rej(new Error(`${m.error.code}: ${m.error.message}`));
  else p.res(m);
};
ws.onerror = () => { console.error('✗ WebSocket error'); process.exit(1); };

ws.onopen = async () => {
  try {
    const a = (await call({ authorize: TOKEN })).authorize;
    console.log('Authorized account :', a.loginid, a.is_virtual ? '(DEMO ✓ — safe)' : '(REAL ⚠️ — token must be remade on demo)', '·', a.currency, 'balance', a.balance);
    console.log('All your accounts  :', (a.account_list || []).map((x) => `${x.loginid}${x.is_virtual ? '(demo)' : '(real)'}`).join(', '));
    const c = await call({ ticks_history: 'frxXAUUSD', style: 'candles', granularity: 900, count: 3, end: 'latest' });
    if (c.candles && c.candles.length) {
      const last = c.candles[c.candles.length - 1];
      console.log('frxXAUUSD M15      : OK — last close', last.close, '(', c.candles.length, 'candles)');
    } else {
      console.log('frxXAUUSD M15      : NO CANDLES —', JSON.stringify(c).slice(0, 200));
    }
  } catch (e) {
    console.error('✗', e.message);
  }
  ws.close();
  process.exit(0);
};
