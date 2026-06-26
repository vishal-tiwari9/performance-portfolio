// app/api/market-data/route.ts
import { NextResponse } from "next/server";
import { PORTFOLIO_HOLDINGS } from "@/lib/portfolio-data";
import { fetchMarketDataBatch } from "@/lib/yahoo-finance";

export const runtime = "nodejs"; // Edge runtime mein yahoo-finance2 kaam nahi karta

export async function GET() {
  try {
    const tickers = PORTFOLIO_HOLDINGS.map((h) => h.ticker);
    const marketData = await fetchMarketDataBatch(tickers);

    return NextResponse.json(
      { data: marketData, fetchedAt: new Date().toISOString() },
      {
        headers: {
          
          "Cache-Control": "s-maxage=10, stale-while-revalidate=5",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}