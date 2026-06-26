// components/SectorGroup.tsx
import { SectorSummary } from "@/lib/types";
import StockRow from "./StockRow";

export default function SectorGroup({
  sector,
  isLoading,
}: {
  sector: SectorSummary;
  isLoading: boolean;
}) {
  const isGain = sector.totalGainLoss >= 0;

  return (
    <div className="mb-8">
      {/* Sector Header */}
      <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-3">
        <h2 className="font-semibold text-gray-200">{sector.sector}</h2>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-400">
            Invested: <span className="text-white font-medium">
              ₹{sector.totalInvestment.toLocaleString("en-IN")}
            </span>
          </span>
          <span className="text-gray-400">
            Value: <span className="text-white font-medium">
              ₹{sector.totalPresentValue.toLocaleString("en-IN")}
            </span>
          </span>
          <span className={isGain ? "text-green-400" : "text-red-400"}>
            {isGain ? "+" : ""}₹{sector.totalGainLoss.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-right">Buy Price</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Invested</th>
              <th className="px-4 py-2 text-right">CMP</th>
              <th className="px-4 py-2 text-right">Present Value</th>
              <th className="px-4 py-2 text-right">Gain/Loss</th>
              <th className="px-4 py-2 text-right">G/L %</th>
              <th className="px-4 py-2 text-right">P/E</th>
              <th className="px-4 py-2 text-right">EPS</th>
            </tr>
          </thead>
          <tbody>
            {sector.holdings.map((holding) => (
              <StockRow key={holding.ticker} holding={holding} isLoading={isLoading} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}