// app/page.tsx
"use client";
import useSWR from "swr";
import { PORTFOLIO_HOLDINGS } from "@/lib/portfolio-data";
import { enrichHoldings, groupBySector } from "@/lib/enrich";
import { MarketData } from "@/lib/types";
import SectorGroup from "@/components/SectorGroup";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  // SWR — automatically refreshes every 15 seconds
  const { data, error, isLoading, isValidating } = useSWR<{
    data: MarketData[];
    fetchedAt: string;
  }>("/api/market-data", fetcher, {
    refreshInterval: 15000,       // 15 sec auto-refresh
    revalidateOnFocus: true,      // Tab switch karo toh bhi refresh
    dedupingInterval: 10000,      // Same request 10 sec mein duplicate mat karo
  });

  const enriched = data
    ? enrichHoldings(PORTFOLIO_HOLDINGS, data.data)
    : enrichHoldings(PORTFOLIO_HOLDINGS, []); // Loading state mein 0 values

  const sectors = groupBySector(enriched);

  const totalInvestment = enriched.reduce((s, h) => s + h.investment, 0);
  const totalPV = enriched.reduce((s, h) => s + h.presentValue, 0);
  const totalGL = totalPV - totalInvestment;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Priyanshu's Portfolio</h1>
        <div className="text-sm text-gray-400">
          {isValidating && <span className="text-blue-400 mr-3">↻ Refreshing...</span>}
          {data?.fetchedAt && (
            <span>Updated: {new Date(data.fetchedAt).toLocaleTimeString("en-IN")}</span>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Invested</p>
          <p className="text-xl font-bold">₹{(totalInvestment / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Present Value</p>
          <p className="text-xl font-bold">₹{(totalPV / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total P&L</p>
          <p className={`text-xl font-bold ${totalGL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalGL >= 0 ? "+" : ""}₹{Math.abs(totalGL).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
          ⚠️ Market data fetch failed. Showing last known values.
        </div>
      )}

      {/* Sector Tables */}
      {sectors.map((sector) => (
        <SectorGroup key={sector.sector} sector={sector} isLoading={isLoading} />
      ))}
    </main>
  );
}