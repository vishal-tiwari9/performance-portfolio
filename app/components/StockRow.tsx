// components/StockRow.tsx
import { EnrichedHolding } from "@/lib/types";

export default function StockRow({
  holding,
  isLoading,
}: {
  holding: EnrichedHolding;
  isLoading: boolean;
}) {
  const isGain = holding.gainloss >= 0;
  const glClass = isGain ? "text-green-400" : "text-red-400";

  // Loading skeleton
  const loadingCell = isLoading ? (
    <span className="inline-block w-16 h-4 bg-gray-700 rounded animate-pulse" />
  ) : null;

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium">{holding.name}</div>
        <div className="text-xs text-gray-500">{holding.ticker}</div>
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        ₹{holding.purchasePrice.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3 text-right">{holding.qty}</td>
      <td className="px-4 py-3 text-right">
        ₹{holding.investment.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {isLoading ? loadingCell : `₹${holding.cmp.toLocaleString("en-IN")}`}
      </td>
      <td className="px-4 py-3 text-right">
        {isLoading ? loadingCell : `₹${holding.presentValue.toLocaleString("en-IN")}`}
      </td>
      <td className={`px-4 py-3 text-right font-medium ${glClass}`}>
        {isLoading
          ? loadingCell
          : `${isGain ? "+" : ""}₹${Math.abs(holding.gainLoss).toLocaleString("en-IN")}`}
      </td>
      <td className={`px-4 py-3 text-right ${glClass}`}>
        {isLoading
          ? loadingCell
          : `${isGain ? "+" : ""}${holding.gainLossPercent.toFixed(2)}%`}
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {holding.peRatio ? holding.peRatio.toFixed(1) : "—"}
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {holding.latestEarnings ? `₹${holding.latestEarnings.toFixed(2)}` : "—"}
      </td>
    </tr>
  );
}