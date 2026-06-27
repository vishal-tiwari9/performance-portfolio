// app/api/market-data/route.ts

import { NextResponse } from "next/server";
import { PORTFOLIO_HOLDINGS } from "@/lib/portfolio-data";
import { fetchMarketDataBatch } from "@/lib/market-fetcher";


export const runtime = "nodejs";

export async function GET() {
  try {
    const tickers = PORTFOLIO_HOLDINGS.map((h) => h.ticker);
    const marketData = await fetchMarketDataBatch(tickers);

    const successCount = marketData.filter((d) => d.cmp > 0).length;

    return NextResponse.json(
      {
        data: marketData,
        fetchedAt: new Date().toISOString(),
        meta: {
          total: marketData.length,
          withLivePrice: successCount,
          partial: successCount < marketData.length,
        },
      },
      {
        headers: {
          
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[API] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST() {
  const { cache } = await import("@/lib/cache");
  cache.delete("market_data_batch");

  
  const { PORTFOLIO_HOLDINGS: holdings } = await import("@/lib/portfolio-data");
  holdings.forEach((h) => cache.delete(`fund_${h.ticker}`));

  return NextResponse.json({ message: "Cache cleared — next GET will fetch fresh data" });
}
