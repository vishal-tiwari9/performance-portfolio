// lib/enrich.ts
import { Holding, MarketData, EnrichedHolding, SectorSummary } from "./types";
import { TOTAL_INVESTMENT } from "./portfolio-data";

export function enrichHoldings(
  holdings: Holding[],
  marketData: MarketData[]
): EnrichedHolding[] {
  const marketMap = new Map(marketData.map((m) => [m.ticker, m]));

  return holdings.map((holding) => {
    const market = marketMap.get(holding.ticker);
    const investment = holding.purchasePrice * holding.qty;
    const cmp = market?.cmp ?? 0;
    const presentValue = cmp * holding.qty;
    const gainLoss = presentValue - investment;

    return {
      ...holding,
      investment,
      portfolioPercent: (investment / TOTAL_INVESTMENT) * 100,
      cmp,
      presentValue,
      gainLoss,
      gainLossPercent: investment > 0 ? (gainLoss / investment) * 100 : 0,
      peRatio: market?.peRatio ?? null,
      latestEarnings: market?.latestEarnings ?? null,
      error: market?.error,
    };
  });
}

export function groupBySector(holdings: EnrichedHolding[]): SectorSummary[] {
  const sectorMap = new Map<string, EnrichedHolding[]>();

  holdings.forEach((h) => {
    const list = sectorMap.get(h.sector) ?? [];
    list.push(h);
    sectorMap.set(h.sector, list);
  });

  return Array.from(sectorMap.entries()).map(([sector, items]) => ({
    sector,
    holdings: items,
    totalInvestment: items.reduce((s, h) => s + h.investment, 0),
    totalPresentValue: items.reduce((s, h) => s + h.presentValue, 0),
    totalGainLoss: items.reduce((s, h) => s + h.gainloss, 0),
  }));
}