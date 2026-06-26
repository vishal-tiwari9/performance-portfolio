// lib/yahoo-finance.ts
import yahooFinance from "yahoo-finance2";
import { cache, TTL } from "./cache";
import { MarketData } from "./types";

// Single stock ka data fetch
async function fetchSingleTicker(ticker: string): Promise<MarketData> {
  try {
    const quote = await yahooFinance.quote(ticker, {
      fields: [
        "regularMarketPrice",   // CMP
        "trailingPE",           // P/E Ratio
        "epsTrailingTwelveMonths", // EPS (Latest Earnings proxy)
      ],
    });

    return {
      ticker,
      cmp: quote.regularMarketPrice ?? 0,
      peRatio: quote.trailingPE ?? null,
      latestEarnings: quote.epsTrailingTwelveMonths ?? null,
    };
  } catch (err) {
    console.error(`Failed to fetch ${ticker}:`, err);
    return {
      ticker,
      cmp: 0,
      peRatio: null,
      latestEarnings: null,
      error: "Fetch failed",
    };
  }
}

// Batch fetch — saare tickers ek saath, with throttling
export async function fetchMarketDataBatch(
  tickers: string[]
): Promise<MarketData[]> {
  const CACHE_KEY = "market_data_batch";

  // Cache hit? Return immediately
  const cached = cache.get<MarketData[]>(CACHE_KEY);
  if (cached) {
    console.log("Cache hit — returning cached market data");
    return cached;
  }

  // Cache miss — fetch karo
  console.log(`Fetching ${tickers.length} tickers from Yahoo Finance...`);

  // Throttle: 5 tickers ek saath max (rate limit se bachne ke liye)
  const results: MarketData[] = [];
  const BATCH_SIZE = 5;
  const DELAY_MS = 300; // 300ms between batches

  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);

    // Parallel fetch within the batch
    const batchResults = await Promise.allSettled(
      batch.map((ticker) => fetchSingleTicker(ticker))
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    });

    // Next batch se pehle thoda ruko (rate limiting)
    if (i + BATCH_SIZE < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // Cache mein store karo
  cache.set(CACHE_KEY, results, TTL.MARKET_DATA);

  return results;
}