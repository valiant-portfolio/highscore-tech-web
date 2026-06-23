// Deriv WebSocket API client — one short-lived connection per bot cycle.
// Requests are matched to responses by req_id. Uses the global WebSocket
// (Node >= 22 / Vercel). Gold (frxXAUUSD) is traded as a MULTIPLIER.
//
// Safety: the bot must trade the DEMO (virtual) account only. After authorize,
// pickAccount() resolves the virtual account and the caller MUST gate on it.

const DERIV_WS = 'wss://ws.derivws.com/websockets/v3';

export interface Candle {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface DerivAccount {
  loginid: string;
  is_virtual: 0 | 1;
  currency: string;
  balance?: number;
}

export interface AuthorizeInfo {
  loginid: string;
  is_virtual: 0 | 1;
  currency: string;
  balance: number;
  account_list: DerivAccount[];
}

export class DerivWS {
  private ws: any;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void; timer: any }>();

  constructor(private token: string, private appId: string) {}

  connect(timeoutMs = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${DERIV_WS}?app_id=${encodeURIComponent(this.appId)}`);
      const t = setTimeout(() => reject(new Error('Deriv WS connect timeout')), timeoutMs);
      this.ws.onopen = () => { clearTimeout(t); resolve(); };
      this.ws.onerror = () => { clearTimeout(t); reject(new Error('Deriv WS connection error')); };
      this.ws.onclose = () => {
        for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Deriv WS closed')); }
        this.pending.clear();
      };
      this.ws.onmessage = (ev: any) => this.onMessage(ev);
    });
  }

  private onMessage(ev: any) {
    let msg: any;
    try {
      msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
    } catch {
      return;
    }
    const id = msg.req_id;
    if (id == null) return;
    const p = this.pending.get(id);
    if (!p) return;
    this.pending.delete(id);
    clearTimeout(p.timer);
    if (msg.error) p.reject(new Error(`${msg.error.code}: ${msg.error.message}`));
    else p.resolve(msg);
  }

  send(request: Record<string, any>, timeoutMs = 15000): Promise<any> {
    const req_id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(req_id);
        reject(new Error('Deriv request timeout: ' + Object.keys(request)[0]));
      }, timeoutMs);
      this.pending.set(req_id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ ...request, req_id }));
    });
  }

  close() {
    try { this.ws?.close(); } catch { /* ignore */ }
  }

  // ── high-level calls ───────────────────────────────────────────────────────
  async authorize(): Promise<AuthorizeInfo> {
    const r = await this.send({ authorize: this.token });
    return r.authorize as AuthorizeInfo;
  }

  /** Closed candles (oldest→newest). granularity in seconds (900 = M15). */
  async candles(symbol: string, granularity: number, count: number): Promise<Candle[]> {
    const r = await this.send({
      ticks_history: symbol, style: 'candles', granularity, count, end: 'latest', adjust_start_time: 1,
    });
    return (r.candles || []).map((c: any) => ({
      epoch: c.epoch, open: +c.open, high: +c.high, low: +c.low, close: +c.close,
    }));
  }

  async balance(loginid?: string): Promise<{ balance: number; currency: string }> {
    const r = await this.send(loginid ? { balance: 1, account: loginid } : { balance: 1 });
    return r.balance;
  }

  /** Price a multiplier contract. side: 'up' | 'down'. SL/TP are MONETARY (account currency). */
  async proposeMultiplier(opts: {
    symbol: string; side: 'up' | 'down'; stake: number; multiplier: number;
    currency?: string; stopLoss?: number; takeProfit?: number; dealCancellation?: number;
  }): Promise<{ id: string; ask_price: number; display_value?: string }> {
    const limit_order: Record<string, number> = {};
    if (opts.stopLoss != null) limit_order.stop_loss = round2(opts.stopLoss);
    if (opts.takeProfit != null) limit_order.take_profit = round2(opts.takeProfit);
    const params: Record<string, any> = {
      proposal: 1,
      amount: opts.stake,
      basis: 'stake',
      contract_type: opts.side === 'up' ? 'MULTUP' : 'MULTDOWN',
      currency: opts.currency || 'USD',
      symbol: opts.symbol,
      multiplier: opts.multiplier,
    };
    if (Object.keys(limit_order).length) params.limit_order = limit_order;
    if (opts.dealCancellation) params.cancellation = `${opts.dealCancellation}m`;
    const r = await this.send(params);
    return r.proposal;
  }

  async buy(proposalId: string, price: number): Promise<{ contract_id: number; buy_price: number; transaction_id: number }> {
    const r = await this.send({ buy: proposalId, price });
    return r.buy;
  }

  async openContract(contract_id: number): Promise<any> {
    const r = await this.send({ proposal_open_contract: 1, contract_id });
    return r.proposal_open_contract;
  }

  async sell(contract_id: number): Promise<{ sold_for: number; transaction_id: number }> {
    const r = await this.send({ sell: contract_id, price: 0 }); // price 0 = sell at market
    return r.sell;
  }

  async portfolio(): Promise<any[]> {
    const r = await this.send({ portfolio: 1 });
    return r.portfolio?.contracts || [];
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Resolve which account the bot may trade. Returns the virtual (demo) account if
 * demoOnly. Throws if demoOnly but the token has no virtual account / isn't on one,
 * so the bot can NEVER place a real-money order by accident.
 */
export function pickAccount(auth: AuthorizeInfo, demoOnly: boolean): DerivAccount {
  if (!demoOnly) {
    return { loginid: auth.loginid, is_virtual: auth.is_virtual, currency: auth.currency, balance: auth.balance };
  }
  // demo-only: the authorized account itself must be virtual (Deriv tokens act on
  // the account they were created under — so the token MUST be made on the demo account).
  if (auth.is_virtual) {
    return { loginid: auth.loginid, is_virtual: 1, currency: auth.currency, balance: auth.balance };
  }
  const virtual = (auth.account_list || []).find((a) => a.is_virtual);
  throw new Error(
    virtual
      ? `Deriv token authorizes a REAL account (${auth.loginid}). Re-create the API token while your DEMO (${virtual.loginid}) account is selected.`
      : `Deriv token authorizes a REAL account (${auth.loginid}) and no virtual account was found. Re-create the token on your demo account.`,
  );
}
