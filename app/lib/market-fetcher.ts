
import axios, { AxiosInstance } from "axios";
import yahooFinance from "yahoo-finance2";
import { cache, TTL } from "./cache";
import { MarketData } from "./types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function fetchCMPFromYahooChart(ticker: string): Promise<number> {
  try {
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`,
      {
        params: {
          range: "1d",
          interval: "1d",
          includePrePost: false,
          events: "div,splits",
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Origin: "https://finance.yahoo.com",
          Referer: "https://finance.yahoo.com/",
        },
        timeout: 10000,
      }
    );

    const result = data?.chart?.result?.[0];
    if (!result) return 0;

   
    const price =
      result.meta?.regularMarketPrice ??
      result.meta?.chartPreviousClose ??
      0;

    return typeof price === "number" && price > 0 ? price : 0;
  } catch (err: unknown) {
    const msg = String(err);
    if (!msg.includes("timeout")) {
      // Don't log timeouts — they're expected on slow networks
      console.warn(`[Yahoo Chart] ${ticker} failed: ${msg.slice(0, 80)}`);
    }
    return 0;
  }
}


interface NSEState {
  client: AxiosInstance;
  lastInit: number;
  ok: boolean;
}


let nseState: NSEState | null = null;

async function getNSEClient(): Promise<AxiosInstance> {
  const SESSION_VALID = TTL.NSE_SESSION;

  if (nseState?.ok && Date.now() - nseState.lastInit < SESSION_VALID) {
    return nseState.client;
  }

  const client = axios.create({
    baseURL: "https://www.nseindia.com",
    timeout: 10000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: "https://www.nseindia.com/",
      Connection: "keep-alive",
    },
  });

  try {
    
    await client.get("/", { timeout: 8000 });
    
    await client.get(
      "/market-data/live-equity-market?index=NIFTY%2050",
      { timeout: 8000 }
    );
    nseState = { client, lastInit: Date.now(), ok: true };
    console.log("[NSE] Session initialized");
  } catch {
    // Session init failed — try anyway with what we have
    nseState = { client, lastInit: Date.now(), ok: false };
    console.warn("[NSE] Session init failed, trying anyway");
  }

  return client;
}

async function fetchCMPFromNSE(yahooTicker: string): Promise<number> {
  
  // "HDFCBANK.NS" → "HDFCBANK"
  // "HDFCBANK.BO" → "HDFCBANK"
  const symbol = yahooTicker.replace(/\.(NS|BO)$/i, "");

  try {
    const client = await getNSEClient();
    const { data } = await client.get(
      `/api/quote-equity?symbol=${encodeURIComponent(symbol)}`,
      { timeout: 8000 }
    );


    const price = data?.priceInfo?.lastPrice ?? 0;
    return typeof price === "number" && price > 0 ? price : 0;
  } catch (err: unknown) {
    console.warn(`[NSE] ${symbol} failed: ${String(err).slice(0, 80)}`);
    return 0;
  }
}

interface Fundamentals {
  peRatio: number | null;
  eps: number | null;
}

async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
  const CACHE_KEY = `fund_${ticker}`;
  const cached = cache.get<Fundamentals>(CACHE_KEY);
  if (cached) return cached;

  const empty: Fundamentals = { peRatio: null, eps: null };

  try {
   
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    });

    
    const sd = (summary as Record<string, Record<string, unknown>>).summaryDetail;
    const ks = (summary as Record<string, Record<string, unknown>>).defaultKeyStatistics;

    const result: Fundamentals = {
      peRatio:
        typeof sd?.trailingPE === "number" ? (sd.trailingPE as number) : null,
      eps:
        typeof ks?.trailingEps === "number" ? (ks.trailingEps as number) : null,
    };

    cache.set(CACHE_KEY, result, TTL.FUNDAMENTALS);
    console.log(`[Fundamentals] ${ticker} P/E=${result.peRatio} EPS=${result.eps}`);
    return result;
  } catch {
    // quoteSummary also rate limited? Cache empty for 1hr, not 24hr
    cache.set(CACHE_KEY, empty, 60 * 60 * 1000);
    return empty;
  }
}



export async function fetchMarketDataBatch(
  tickers: string[]
): Promise<MarketData[]> {
  const CACHE_KEY = "market_data_batch";

  
  const cached = cache.get<MarketData[]>(CACHE_KEY);
  if (cached) {
    const hits = cached.filter((r) => r.cmp > 0).length;
    console.log(`[Cache HIT] ${cached.length} stocks (${hits} with price)`);
    return cached;
  }

  console.log(`\n[Market Fetch] Starting ${tickers.length} tickers...`);
  const start = Date.now();

  const BATCH_SIZE = 5;
  const DELAY_MS = 400;
  const cmpMap = new Map<string, number>();

  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (ticker) => {
        // Try Yahoo chart first (fastest)
        const yahooCMP = await fetchCMPFromYahooChart(ticker);
        if (yahooCMP > 0) {
          return { ticker, cmp: yahooCMP, source: "yahoo-chart" };
        }

        // Yahoo chart failed → try NSE
        const nseCMP = await fetchCMPFromNSE(ticker);
        if (nseCMP > 0) {
          return { ticker, cmp: nseCMP, source: "nse" };
        }

        // Both failed
        return { ticker, cmp: 0, source: "none" };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        cmpMap.set(result.value.ticker, result.value.cmp);
        if (result.value.source !== "none") {
          console.log(
            `  ✓ ${result.value.ticker}: ₹${result.value.cmp} [${result.value.source}]`
          );
        } else {
          console.warn(`  ✗ ${result.value.ticker}: no data`);
        }
      }
    });

    if (i + BATCH_SIZE < tickers.length) {
      await sleep(DELAY_MS);
    }
  }


  const fundMap = new Map<string, Fundamentals>();
  const FUND_BATCH = 3;
  const FUND_DELAY = 600;

  for (let i = 0; i < tickers.length; i += FUND_BATCH) {
    const batch = tickers.slice(i, i + FUND_BATCH);
    const results = await Promise.allSettled(
      batch.map((t) => fetchFundamentals(t))
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        fundMap.set(batch[idx], result.value);
      } else {
        fundMap.set(batch[idx], { peRatio: null, eps: null });
      }
    });

    if (i + FUND_BATCH < tickers.length) {
      await sleep(FUND_DELAY);
    }
  }

  // ── Assemble final results ────────────────────────────────
  const results: MarketData[] = tickers.map((ticker) => {
    const cmp = cmpMap.get(ticker) ?? 0;
    const fund = fundMap.get(ticker) ?? { peRatio: null, eps: null };

    return {
      ticker,
      cmp,
      peRatio: fund.peRatio,
      latestEarnings: fund.eps,
      error: cmp === 0 ? "Price unavailable" : undefined,
    };
  });

  const successCount = results.filter((r) => r.cmp > 0).length;
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\n[Market Fetch] Done in ${elapsed}s — ${successCount}/${tickers.length} stocks with live price\n`
  );

  // Cache even partial results — better than hammering sources
  const ttl = successCount > 0 ? TTL.MARKET_DATA : TTL.ERROR_BACKOFF;
  cache.set(CACHE_KEY, results, ttl);

  return results;
}
