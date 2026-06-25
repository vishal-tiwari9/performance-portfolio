import {Holding} from "./types";


export const PORTFOLIO_HOLDINGS:Holding[]=[
 //Finance sector 
 { sector: "Financial", name: "HDFC Bank",        ticker: "HDFCBANK.NS",    purchasePrice: 1490,  qty: 50,   exchange: "NSE" },
  { sector: "Financial", name: "Bajaj Finance",    ticker: "BAJFINANCE.NS",  purchasePrice: 6466,  qty: 15,   exchange: "NSE" },
  { sector: "Financial", name: "ICICI Bank",       ticker: "ICICIBANK.NS",   purchasePrice: 780,   qty: 84,   exchange: "NSE" },
  { sector: "Financial", name: "Bajaj Housing",    ticker: "BAJAJHFL.NS",    purchasePrice: 130,   qty: 504,  exchange: "NSE" },
  { sector: "Financial", name: "Savani Financials",ticker: "SAVANIFINSER.NS",purchasePrice: 24,    qty: 1080, exchange: "NSE" },



  // Tech sector 
  { sector: "Tech",      name: "Affle India",      ticker: "AFFLE.NS",       purchasePrice: 1151,  qty: 50,   exchange: "NSE" },
  { sector: "Tech",      name: "LTI Mindtree",     ticker: "LTIM.NS",        purchasePrice: 4775,  qty: 16,   exchange: "NSE" },
  { sector: "Tech",      name: "KPIT Tech",        ticker: "KPITTECH.NS",    purchasePrice: 672,   qty: 61,   exchange: "NSE" },
  { sector: "Tech",      name: "Tata Tech",        ticker: "TATATECH.NS",    purchasePrice: 1072,  qty: 63,   exchange: "NSE" },
  { sector: "Tech",      name: "BLS E-Services",   ticker: "BLSE.NS",        purchasePrice: 232,   qty: 191,  exchange: "NSE" },
  { sector: "Tech",      name: "Tanla Platforms",  ticker: "TANLA.NS",       purchasePrice: 1134,  qty: 45,   exchange: "NSE" },

// consumer 
  { sector: "Consumer",  name: "Dmart",            ticker: "DMART.NS",       purchasePrice: 3777,  qty: 27,   exchange: "NSE" },
  { sector: "Consumer",  name: "Tata Consumer",    ticker: "TATACONSUM.NS",  purchasePrice: 845,   qty: 90,   exchange: "NSE" },
  { sector: "Consumer",  name: "Pidilite",         ticker: "PIDILITIND.NS",  purchasePrice: 2376,  qty: 36,   exchange: "NSE" },
  

  //power
    { sector: "Power",     name: "Tata Power",       ticker: "TATAPOWER.NS",   purchasePrice: 224,   qty: 225,  exchange: "NSE" },
  { sector: "Power",     name: "KPI Green",        ticker: "KPIGREEN.NS",    purchasePrice: 875,   qty: 50,   exchange: "NSE" },
  { sector: "Power",     name: "Suzlon",           ticker: "SUZLON.NS",      purchasePrice: 44,    qty: 450,  exchange: "NSE" },
  { sector: "Power",     name: "Gensol",           ticker: "GENSOL.NS",      purchasePrice: 998,   qty: 45,   exchange: "NSE" },

  // pipe-sector
  { sector: "Pipes",     name: "Hariom Pipes",     ticker: "HARIOMPIPE.NS",  purchasePrice: 580,   qty: 60,   exchange: "NSE" },
  { sector: "Pipes",     name: "Astral",           ticker: "ASTRAL.NS",      purchasePrice: 1517,  qty: 56,   exchange: "NSE" },
  { sector: "Pipes",     name: "Polycab",          ticker: "POLYCAB.NS",     purchasePrice: 2818,  qty: 28,   exchange: "NSE" },


  //other-sectors
  { sector: "Others",    name: "Clean Science",    ticker: "CLEANSCI.NS",    purchasePrice: 1610,  qty: 32,   exchange: "NSE" },
  { sector: "Others",    name: "Deepak Nitrite",   ticker: "DEEPAKNTR.NS",   purchasePrice: 2248,  qty: 27,   exchange: "NSE" },
  { sector: "Others",    name: "Fine Organic",     ticker: "FINEORG.NS",     purchasePrice: 4284,  qty: 16,   exchange: "NSE" },
  { sector: "Others",    name: "Gravita",          ticker: "GRAVITA.NS",     purchasePrice: 2037,  qty: 8,    exchange: "NSE" },
  { sector: "Others",    name: "SBI Life",         ticker: "SBILIFE.NS",     purchasePrice: 1197,  qty: 49,   exchange: "NSE" },

];

export const TOTAL_INVESTMENT = PORTFOLIO_HOLDINGS.reduce(
    (sum,h)=> sum+h.purchasePrice *h.qty,
    0
);