// Bybit V5 REST client — USDT perpetual futures (category 'linear').
// HMAC-signed, uses global fetch (Node >= 18). Testnet by default.
// Maps cleanly to the structure strategy: SL/TP are PRICE levels; long = Buy,
// short = Sell; risk per trade = qty * |entry - stopLoss|.

import crypto from 'crypto';

export interface Candle {
  start: number; // ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BybitPosition {
  symbol: string;
  side: 'Buy' | 'Sell' | '';
  size: number;
  avgPrice: number;
  unrealisedPnl: number;
  stopLoss: number;
  takeProfit: number;
  positionIdx: number;
}

export class BybitClient {
  private base: string;
  constructor(private key: string, private secret: string, testnet = true) {
    this.base = testnet ? 'https://api-testnet.bybit.com' : 'https://api.bybit.com';
  }

  private qs(params: Record<string, any>) {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
  }

  private async signed(method: 'GET' | 'POST', path: string, params: Record<string, any> = {}) {
    const ts = Date.now().toString();
    const recv = '5000';
    let url = this.base + path;
    let body = '';
    let payload = '';
    if (method === 'GET') {
      payload = this.qs(params);
      if (payload) url += `?${payload}`;
    } else {
      body = JSON.stringify(params);
      payload = body;
    }
    const sign = crypto.createHmac('sha256', this.secret).update(ts + this.key + recv + payload).digest('hex');
    const headers: Record<string, string> = {
      'X-BAPI-API-KEY': this.key,
      'X-BAPI-TIMESTAMP': ts,
      'X-BAPI-RECV-WINDOW': recv,
      'X-BAPI-SIGN': sign,
      'X-BAPI-SIGN-TYPE': '2',
    };
    if (method === 'POST') headers['Content-Type'] = 'application/json';
    const res = await fetch(url, { method, headers, body: method === 'POST' ? body : undefined });
    const json: any = await res.json();
    if (json.retCode !== 0) throw new Error(`Bybit ${path}: ${json.retCode} ${json.retMsg}`);
    return json.result;
  }

  private async publicGet(path: string, params: Record<string, any> = {}) {
    const q = this.qs(params);
    const res = await fetch(this.base + path + (q ? `?${q}` : ''));
    const json: any = await res.json();
    if (json.retCode !== 0) throw new Error(`Bybit ${path}: ${json.retCode} ${json.retMsg}`);
    return json.result;
  }

  /** Candles oldest→newest. interval in minutes as a string ('15'), or 'D'. */
  async candles(symbol: string, interval: string, limit = 200): Promise<Candle[]> {
    const r = await this.publicGet('/v5/market/kline', { category: 'linear', symbol, interval, limit });
    const list: Candle[] = (r.list || []).map((c: string[]) => ({
      start: +c[0], open: +c[1], high: +c[2], low: +c[3], close: +c[4], volume: +c[5],
    }));
    return list.reverse(); // V5 returns newest-first
  }

  async usdtBalance(): Promise<number> {
    const r = await this.signed('GET', '/v5/account/wallet-balance', { accountType: 'UNIFIED' });
    const coin = (r.list?.[0]?.coin || []).find((c: any) => c.coin === 'USDT');
    return coin ? +coin.walletBalance : 0;
  }

  /** The open position on `symbol`, or null if flat. */
  async position(symbol: string): Promise<BybitPosition | null> {
    const r = await this.signed('GET', '/v5/position/list', { category: 'linear', symbol });
    const p = (r.list || []).find((x: any) => +x.size > 0);
    if (!p) return null;
    return {
      symbol: p.symbol, side: p.side, size: +p.size, avgPrice: +p.avgPrice,
      unrealisedPnl: +p.unrealisedPnl, stopLoss: p.stopLoss ? +p.stopLoss : 0,
      takeProfit: p.takeProfit ? +p.takeProfit : 0, positionIdx: +p.positionIdx,
    };
  }

  async setLeverage(symbol: string, leverage: number) {
    try {
      await this.signed('POST', '/v5/position/set-leverage', {
        category: 'linear', symbol, buyLeverage: String(leverage), sellLeverage: String(leverage),
      });
    } catch (e: any) {
      if (!/110043|not modified/i.test(e.message)) throw e; // ignore "leverage not modified"
    }
  }

  /** Market entry with price-based SL/TP. side 'Buy'(long) | 'Sell'(short). qty in base coin (string). */
  async marketEntry(opts: { symbol: string; side: 'Buy' | 'Sell'; qty: string; stopLoss?: number; takeProfit?: number }) {
    const body: Record<string, any> = {
      category: 'linear', symbol: opts.symbol, side: opts.side, orderType: 'Market',
      qty: opts.qty, timeInForce: 'IOC', positionIdx: 0,
    };
    if (opts.stopLoss) { body.stopLoss = String(opts.stopLoss); body.slTriggerBy = 'LastPrice'; }
    if (opts.takeProfit) { body.takeProfit = String(opts.takeProfit); body.tpTriggerBy = 'LastPrice'; }
    if (body.stopLoss || body.takeProfit) body.tpslMode = 'Full';
    return this.signed('POST', '/v5/order/create', body);
  }

  /** Move SL/TP on the open position (used by the profit-secure monitor). */
  async setStops(symbol: string, opts: { stopLoss?: number; takeProfit?: number }) {
    const body: Record<string, any> = { category: 'linear', symbol, positionIdx: 0, tpslMode: 'Full' };
    if (opts.stopLoss != null) body.stopLoss = String(opts.stopLoss);
    if (opts.takeProfit != null) body.takeProfit = String(opts.takeProfit);
    return this.signed('POST', '/v5/position/trading-stop', body);
  }

  /** Close the open position at market (reduce-only). */
  async closePosition(symbol: string, side: 'Buy' | 'Sell', qty: number) {
    return this.signed('POST', '/v5/order/create', {
      category: 'linear', symbol, side: side === 'Buy' ? 'Sell' : 'Buy', orderType: 'Market',
      qty: String(qty), reduceOnly: true, positionIdx: 0, timeInForce: 'IOC',
    });
  }

  /** Instrument filters: lotSizeFilter (qtyStep, minOrderQty), priceFilter (tickSize). */
  async instrument(symbol: string) {
    const r = await this.publicGet('/v5/market/instruments-info', { category: 'linear', symbol });
    return r.list?.[0];
  }
}
