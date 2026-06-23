// Read-only Bybit V5 check: BTCUSDT 15m klines (public) + signed UNIFIED wallet
// balance (proves the keys work). No trades. Run: node scripts/bybit-check.mjs
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const KEY = process.env.BYBIT_API_KEY;
const SECRET = process.env.BYBIT_API_SECRET;
const TESTNET = (process.env.BYBIT_TESTNET || 'true') !== 'false';
const BASE = TESTNET ? 'https://api-testnet.bybit.com' : 'https://api.bybit.com';
if (!KEY || !SECRET) { console.error('✗ BYBIT_API_KEY / BYBIT_API_SECRET missing in .env.local'); process.exit(1); }

console.log(`Bybit ${TESTNET ? 'TESTNET' : 'MAINNET'} · ${BASE}`);

async function publicGet(path) {
  const r = await fetch(BASE + path);
  return r.json();
}
async function privateGet(path, query = '') {
  const ts = Date.now().toString();
  const recv = '5000';
  const sign = crypto.createHmac('sha256', SECRET).update(ts + KEY + recv + query).digest('hex');
  const url = BASE + path + (query ? `?${query}` : '');
  const r = await fetch(url, {
    headers: { 'X-BAPI-API-KEY': KEY, 'X-BAPI-TIMESTAMP': ts, 'X-BAPI-RECV-WINDOW': recv, 'X-BAPI-SIGN': sign },
  });
  return r.json();
}

try {
  // 1) public candles (V5 kline list is newest-first: [start, open, high, low, close, vol, turnover])
  const k = await publicGet('/v5/market/kline?category=linear&symbol=BTCUSDT&interval=15&limit=3');
  if (k.retCode === 0 && k.result?.list?.length) {
    console.log('BTCUSDT 15m klines :', 'OK — last close', k.result.list[0][4], `(${k.result.list.length} bars)`);
  } else {
    console.log('BTCUSDT 15m klines : ERROR', k.retCode, k.retMsg);
  }

  // 2) signed wallet balance (proves auth + trade keys)
  const b = await privateGet('/v5/account/wallet-balance', 'accountType=UNIFIED');
  if (b.retCode === 0) {
    const coin = (b.result?.list?.[0]?.coin || []).find((c) => c.coin === 'USDT');
    console.log('Auth (signed call) :', 'OK ✓ — UNIFIED USDT balance', coin ? coin.walletBalance : '(no USDT yet — claim test funds)');
  } else {
    console.log('Auth (signed call) : ERROR', b.retCode, b.retMsg);
  }
} catch (e) {
  console.error('✗', e.message);
}
