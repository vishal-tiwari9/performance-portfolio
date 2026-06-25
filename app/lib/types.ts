

export interface Holding {
    sector :string;
    name:string;
    ticker:string;
    purchasePrice:number;
    qty:number;
    exchange:string; // NSE or BSE 
}

export interface MarketData{
    ticker:string;
    cmp:number; // Current market Price 
    peRatio:number |null;
    latestEarnings:number |null;
    error?:string;
}

export interface EnrichedHolding extends Holding{
    investment:number; // purchasePrice × qty
    portfolioPercent:number;// this holding / total investment
    presentValue:number; // cmp × qty
    gainloss:number;// presentValue - investment
    gainLossPercent:number;
    cmp:number;
    peRatio:number|null;
    latestEarnings:number|null;
    isLoading?:boolean;
    error?:string;



}

export interface SectorSummary{
    sector:string;
    holdings:EnrichedHolding[];
    totalInvestment:number;
    totalPresentValue:number;
    totalGainLoss:number;

}

