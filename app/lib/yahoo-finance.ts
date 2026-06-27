import yahooFinance from "yahoo-finance2";
import { cache, TTL } from "./cache";
import { MarketData } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMarketDataBatch(
  tickers: string[]
): Promise<MarketData[]> {
  const CACHE_KEY = "market_data_batch";

  const cached = cache.get<MarketData[]>(CACHE_KEY);
  if (cached) {
    console.log(`[Cache HIT] ${cached.length} stocks`);
    return cached;
  }

  console.log(`[Fetching] ${tickers.length} tickers as single batch...`);

  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      
      const quotes = await yahooFinance.quote(tickers, {
        fields: [
          "regularMarketPrice",
          "trailingPE",
          "epsTrailingTwelveMonths",
          "symbol",
        ],
      });

      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

      const results: MarketData[] = quotesArray.map((q) => ({
        ticker: q.symbol ?? "",
        cmp: q.regularMarketPrice ?? 0,
        peRatio: q.trailingPE ?? null,
        latestEarnings: q.epsTrailingTwelveMonths ?? null,
      }));

      
      const fetched = new Set(results.map((r) => r.ticker));
      tickers
        .filter((t) => !fetched.has(t))
        .forEach((ticker) =>
          results.push({ ticker, cmp: 0, peRatio: null, latestEarnings: null, error: "Not found" })
        );

      console.log(
        `[Done] ${results.filter((r) => r.cmp > 0).length}/${tickers.length} stocks fetched`
      );

      cache.set(CACHE_KEY, results, TTL.MARKET_DATA);
      return results;

    } catch (err: unknown) {
      const msg = String(err);
      const isRateLimit =
        msg.includes("Too Many Requests") || msg.includes("invalid-json");

      if (isRateLimit && attempt < 3) {
        const wait = attempt * 3000; // 3s, 6s
        console.warn(`[Rate Limited] Attempt ${attempt}/3. Waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      
      console.error(`[Failed after ${attempt} attempts]:`, msg);
      const fallback: MarketData[] = tickers.map((ticker) => ({
        ticker,
        cmp: 0,
        peRatio: null,
        latestEarnings: null,
        error: "Rate limited",
      }));
      cache.set(CACHE_KEY, fallback, 30_000); 
      return fallback;
    }
  }

  return [];
}