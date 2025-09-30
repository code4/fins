import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Schema definitions matching the main app
const questionRequestSchema = z.object({
  question: z.string(),
  context: z.object({
    accounts: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    selectionMode: z.string().optional(),
  }).optional(),
  placeholders: z.record(z.string()).optional(),
});

interface QuestionResponse {
  id: string;
  status: "matched" | "review" | "no_match";
  answer?: {
    id: string;
    title: string;
    content: string;
    category?: string;
    answerType?: string;
    data?: any;
  };
  confidence?: "high" | "medium" | "low";
  message?: string;
}

// Comprehensive mock answers matching server/storage.ts
const mockAnswers = [
  {
    id: "ytd-performance-sp500",
    title: "YTD Performance vs S&P 500",
    content: "Your portfolio has delivered exceptional performance year-to-date, achieving a +14.7% return compared to the S&P 500's +11.2% return. This represents a significant 3.5 percentage point outperformance, driven primarily by strategic overweights in technology (+28.3%) and healthcare (+19.6%) sectors. The portfolio's risk-adjusted returns demonstrate superior efficiency with a Sharpe ratio of 1.34 versus the benchmark's 1.12, indicating better return per unit of risk taken.",
    category: "Performance",
    keywords: ["ytd", "performance", "s&p", "sp", "500", "benchmark", "comparison", "return", "outperform", "year", "to", "date", "vs", "versus", "compared"],
    answerType: "performance",
    data: {
      portfolioReturn: 14.7,
      benchmarkReturn: 11.2,
      outperformance: 3.5,
      sharpeRatio: 1.34,
      benchmarkSharpe: 1.12,
      topContributors: ["Technology", "Healthcare", "Financials"],
      chartData: [
        { month: "Jan", portfolio: 2.1, benchmark: 1.8 },
        { month: "Feb", portfolio: 4.3, benchmark: 3.2 },
        { month: "Mar", portfolio: 6.8, benchmark: 5.1 },
        { month: "Apr", portfolio: 8.2, benchmark: 6.7 },
        { month: "May", portfolio: 10.5, benchmark: 8.3 },
        { month: "Jun", portfolio: 12.1, benchmark: 9.8 },
        { month: "Jul", portfolio: 13.6, benchmark: 10.9 },
        { month: "Aug", portfolio: 14.7, benchmark: 11.2 }
      ]
    }
  },
  {
    id: "top-holdings",
    title: "Top 10 Holdings Analysis",
    content: "Your portfolio's largest positions represent 43.2% of total assets, providing strong concentration in high-conviction investments while maintaining diversification. Microsoft (4.8%) leads as your top holding, followed by Apple (4.2%) and NVIDIA (3.9%). The weighted average P/E ratio of your top 10 holdings is 24.3x, reflecting a quality growth orientation. These positions have contributed +2.8% to overall portfolio performance this year.",
    category: "Holdings",
    keywords: ["top", "holdings", "weight", "positions", "largest", "biggest", "concentration", "diversification", "10", "ten", "show", "major"],
    answerType: "holdings",
    data: {
      topHoldings: [
        { name: "Microsoft Corp", symbol: "MSFT", weight: 4.8, return: 16.2, sector: "Technology" },
        { name: "Apple Inc", symbol: "AAPL", weight: 4.2, return: 12.4, sector: "Technology" },
        { name: "NVIDIA Corp", symbol: "NVDA", weight: 3.9, return: 34.7, sector: "Technology" },
        { name: "Amazon.com Inc", symbol: "AMZN", weight: 3.6, return: 18.9, sector: "Consumer Disc." },
        { name: "Alphabet Inc", symbol: "GOOGL", weight: 3.4, return: 15.3, sector: "Technology" },
        { name: "Tesla Inc", symbol: "TSLA", weight: 3.2, return: 22.1, sector: "Consumer Disc." },
        { name: "Johnson & Johnson", symbol: "JNJ", weight: 3.1, return: 8.7, sector: "Healthcare" },
        { name: "Berkshire Hathaway", symbol: "BRK.B", weight: 2.9, return: 11.3, sector: "Financials" },
        { name: "UnitedHealth Group", symbol: "UNH", weight: 2.8, return: 13.9, sector: "Healthcare" },
        { name: "Procter & Gamble", symbol: "PG", weight: 2.7, return: 9.4, sector: "Consumer Staples" }
      ],
      totalWeight: 43.2,
      avgPE: 24.3,
      contribution: 2.8
    }
  },
  {
    id: "risk-metrics-beta",
    title: "Risk Metrics & Portfolio Beta",
    content: "Your portfolio exhibits a beta of 1.08 relative to the S&P 500, indicating slightly higher systematic risk than the market. The annual volatility stands at 16.4%, compared to the market's 18.1%, suggesting effective risk management through diversification. Maximum drawdown over the past 12 months was -8.2%, occurring during the March correction, with recovery completed within 6 weeks. The portfolio's Value at Risk (95% confidence) is -2.1% over a 1-day period.",
    category: "Risk",
    keywords: ["beta", "volatility", "risk", "metrics", "standard", "deviation", "var", "drawdown"],
    answerType: "risk",
    data: {
      beta: 1.08,
      volatility: 16.4,
      marketVolatility: 18.1,
      maxDrawdown: -8.2,
      var95: -2.1,
      sharpeRatio: 1.34,
      sortinoRatio: 1.89,
      informationRatio: 0.67,
      trackingError: 4.2,
      correlationToMarket: 0.87
    }
  },
  {
    id: "sector-allocation",
    title: "Sector Allocation Strategy",
    content: "Your portfolio maintains a strategic sector allocation designed to capitalize on secular growth trends while providing defensive characteristics. Technology leads at 28.3% (vs S&P 500: 22.1%), reflecting conviction in digital transformation themes. Healthcare at 15.2% and Financials at 14.8% provide balance, while Consumer Discretionary (12.4%) captures economic reopening themes. The allocation generated +1.9% of excess return through sector selection this year.",
    category: "Allocation",
    keywords: ["sector", "allocation", "breakdown", "diversification", "strategy", "weight", "by", "industry", "industries", "split"],
    answerType: "allocation",
    data: {
      sectors: [
        { name: "Technology", portfolio: 28.3, benchmark: 22.1, excess: 6.2, return: 18.7 },
        { name: "Healthcare", portfolio: 15.2, benchmark: 13.8, excess: 1.4, return: 11.4 },
        { name: "Financials", portfolio: 14.8, benchmark: 16.2, excess: -1.4, return: 9.8 },
        { name: "Consumer Discretionary", portfolio: 12.4, benchmark: 10.9, excess: 1.5, return: 15.2 },
        { name: "Consumer Staples", portfolio: 8.9, benchmark: 7.1, excess: 1.8, return: 6.3 },
        { name: "Industrials", portfolio: 7.8, benchmark: 8.4, excess: -0.6, return: 12.1 },
        { name: "Energy", portfolio: 4.2, benchmark: 5.8, excess: -1.6, return: 24.6 },
        { name: "Materials", portfolio: 3.1, benchmark: 2.9, excess: 0.2, return: 8.9 },
        { name: "Communication", portfolio: 2.8, benchmark: 8.1, excess: -5.3, return: 14.3 },
        { name: "Utilities", portfolio: 1.9, benchmark: 2.8, excess: -0.9, return: 4.2 },
        { name: "Real Estate", portfolio: 0.6, benchmark: 1.9, excess: -1.3, return: 7.8 }
      ],
      excessReturn: 1.9
    }
  },
  {
    id: "dividend-income",
    title: "Dividend Income & Yield Analysis",
    content: "Your portfolio generates substantial dividend income with a current yield of 2.8%, exceeding the S&P 500's 1.9% yield. Annual dividend income totals $42,300, representing a 12.4% increase from last year. The portfolio features 67 dividend-paying stocks, with 23 classified as Dividend Aristocrats. Forward dividend growth is projected at 8.2% annually, supported by strong corporate fundamentals and payout ratios averaging 52%.",
    category: "Income",
    keywords: ["dividend", "yield", "income", "distribution", "payout", "aristocrats"],
    answerType: "dividend",
    data: {
      currentYield: 2.8,
      benchmarkYield: 1.9,
      annualIncome: 42300,
      incomeGrowth: 12.4,
      dividendStocks: 67,
      aristocrats: 23,
      forwardGrowth: 8.2,
      avgPayoutRatio: 52,
      topDividendStocks: [
        { name: "Microsoft", yield: 0.9, payment: 1847 },
        { name: "Johnson & Johnson", yield: 2.6, payment: 1623 },
        { name: "Procter & Gamble", yield: 2.4, payment: 1344 },
        { name: "Coca-Cola", yield: 3.1, payment: 987 },
        { name: "Chevron", yield: 3.4, payment: 856 }
      ]
    }
  },
  {
    id: "trading-activity",
    title: "Trading Activity Summary",
    content: "Portfolio turnover for the past 12 months was 23%, indicating an active but measured approach to position management. Total trading volume reached $2.8M across 147 transactions, with an average holding period of 14.2 months. The most significant trades included adding $180K to NVIDIA (+2.1% position) and reducing Tesla exposure by $95K (-1.3% position). Transaction costs averaged 0.08% of trade value, well below industry benchmarks.",
    category: "Trading",
    keywords: ["trading", "activity", "turnover", "transactions", "buy", "sell", "volume"],
    answerType: "trading",
    data: {
      turnoverRate: 23,
      totalVolume: 2800000,
      transactionCount: 147,
      avgHoldingPeriod: 14.2,
      transactionCost: 0.08,
      majorTrades: [
        { type: "Buy", security: "NVIDIA Corp", amount: 180000, impact: 2.1, date: "2024-08-15" },
        { type: "Sell", security: "Tesla Inc", amount: -95000, impact: -1.3, date: "2024-07-22" },
        { type: "Buy", security: "Microsoft Corp", amount: 125000, impact: 1.8, date: "2024-06-10" },
        { type: "Sell", security: "Meta Platforms", amount: -87000, impact: -1.1, date: "2024-05-18" }
      ]
    }
  },
  {
    id: "esg-scoring",
    title: "ESG Scoring & Sustainable Investing",
    content: "Your portfolio demonstrates strong ESG characteristics with an overall MSCI ESG score of 8.4 (AAA rating), significantly outpacing the S&P 500's score of 6.2. Environmental score of 8.7 reflects substantial clean energy and technology exposure, while Social score of 8.1 and Governance score of 8.3 indicate focus on responsible corporate practices. Carbon intensity is 65% lower than the benchmark at 47.2 tons CO2e per $1M invested.",
    category: "ESG",
    keywords: ["esg", "sustainable", "environmental", "social", "governance", "carbon", "responsible"],
    answerType: "esg",
    data: {
      overallScore: 8.4,
      benchmarkScore: 6.2,
      rating: "AAA",
      environmentalScore: 8.7,
      socialScore: 8.1,
      governanceScore: 8.3,
      carbonIntensity: 47.2,
      benchmarkCarbon: 134.7,
      carbonReduction: 65,
      sustainableRevenue: 34.2
    }
  },
  {
    id: "expense-ratio",
    title: "Expense Ratio Analysis",
    content: "Your portfolio maintains a cost-efficient structure with a weighted average expense ratio of 0.47%, significantly below the industry average of 0.68% for actively managed funds. Index funds comprise 38% of holdings with ultra-low fees averaging 0.08%, while active strategies represent 62% with an average expense ratio of 0.71%. Total annual fees across all holdings amount to approximately $7,100, representing strong value given the portfolio's active management and outperformance.",
    category: "Costs",
    keywords: ["expense", "ratio", "fees", "costs", "management", "fee", "cheap", "expensive"],
    answerType: "costs",
    data: {
      avgExpenseRatio: 0.47,
      industryAverage: 0.68,
      indexFundRatio: 0.08,
      activeFundRatio: 0.71,
      indexAllocation: 38,
      activeAllocation: 62,
      totalAnnualFees: 7100,
      costBreakdown: [
        { type: "Index Funds", allocation: 38, avgFee: 0.08, totalCost: 1200 },
        { type: "Active Equity", allocation: 45, avgFee: 0.68, totalCost: 4600 },
        { type: "Active Fixed Income", allocation: 17, avgFee: 0.81, totalCost: 1300 }
      ]
    }
  },
  {
    id: "geographic-diversification",
    title: "Geographic Diversification",
    content: "Your portfolio exhibits strong international diversification with 72% US equity exposure, 18% developed international markets, and 10% emerging markets allocation. European holdings (12%) are led by strong positions in ASML and Nestlé, while Asia-Pacific exposure (14%) includes Taiwan Semiconductor and Samsung. Currency hedging covers 60% of international positions, reducing volatility while maintaining global growth exposure.",
    category: "Geographic",
    keywords: ["geographic", "international", "global", "region", "country", "foreign", "domestic", "us", "europe", "asia", "regional", "geographical", "worldwide"],
    answerType: "geographic",
    data: {
      usExposure: 72,
      developedIntl: 18,
      emergingMarkets: 10,
      europeanHoldings: 12,
      asiaPacific: 14,
      currencyHedged: 60,
      topIntlHoldings: [
        { name: "ASML Holding", country: "Netherlands", weight: 1.8, sector: "Technology" },
        { name: "Taiwan Semiconductor", country: "Taiwan", weight: 1.6, sector: "Technology" },
        { name: "Nestlé SA", country: "Switzerland", weight: 1.4, sector: "Consumer Staples" },
        { name: "Samsung Electronics", country: "South Korea", weight: 1.2, sector: "Technology" },
        { name: "LVMH", country: "France", weight: 1.1, sector: "Consumer Discretionary" }
      ]
    }
  },
  {
    id: "bond-portfolio",
    title: "Bond Portfolio Analysis",
    content: "Your fixed income allocation of 25% provides portfolio stability with a duration of 4.2 years and average credit quality of AA-. Government bonds represent 60% of fixed income (15% of total portfolio), with corporate investment grade at 35% and high yield at 5%. The bond portfolio yields 4.3% currently, contributing $6,400 annually to income. Interest rate sensitivity is well-managed with laddered maturities from 2025 to 2034.",
    category: "Fixed Income",
    keywords: ["bond", "fixed", "income", "duration", "yield", "credit", "government", "corporate", "treasury", "municipal"],
    answerType: "fixed_income",
    data: {
      fixedIncomeAllocation: 25,
      duration: 4.2,
      averageCredit: "AA-",
      currentYield: 4.3,
      annualIncome: 6400,
      governmentBonds: 60,
      corporateIG: 35,
      highYield: 5,
      maturityLadder: [
        { year: "2025", allocation: 15, yield: 3.8 },
        { year: "2026", allocation: 18, yield: 4.1 },
        { year: "2027", allocation: 20, yield: 4.3 },
        { year: "2028", allocation: 17, yield: 4.5 },
        { year: "2029-2034", allocation: 30, yield: 4.7 }
      ]
    }
  },
  {
    id: "alternative-investments",
    title: "Alternative Investments Overview",
    content: "Alternative investments comprise 8% of your total portfolio allocation, providing diversification and inflation protection. REITs represent the largest alternative holding at 4.2%, delivering 9.1% returns year-to-date. Commodities exposure (2.3%) includes gold ETFs and energy futures, while private equity allocations (1.5%) are accessed through interval funds. These alternatives have contributed +0.7% to overall portfolio performance.",
    category: "Alternatives",
    keywords: ["alternatives", "reit", "commodities", "private", "equity", "gold", "real", "estate"],
    answerType: "alternatives",
    data: {
      totalAlternatives: 8,
      reitAllocation: 4.2,
      reitReturn: 9.1,
      commoditiesAllocation: 2.3,
      privateEquityAllocation: 1.5,
      performanceContribution: 0.7,
      alternativeBreakdown: [
        { type: "REITs", allocation: 4.2, return: 9.1, income: 3.8 },
        { type: "Commodities", allocation: 2.3, return: 12.4, income: 0 },
        { type: "Private Equity", allocation: 1.5, return: 15.2, income: 0 }
      ]
    }
  },
  {
    id: "tax-efficiency",
    title: "Tax Efficiency Analysis",
    content: "Your portfolio demonstrates strong tax efficiency with 67% of holdings in tax-advantaged accounts (401k, IRA). Tax-loss harvesting generated $3,200 in realized losses to offset gains, while municipal bonds provide $1,800 in tax-free income annually. Asset location optimization places growth stocks in IRAs and dividend stocks in taxable accounts. The effective tax rate on portfolio income is 18.3%, well below your marginal rate of 28%.",
    category: "Tax",
    keywords: ["tax", "efficiency", "harvest", "loss", "municipal", "ira", "401k", "taxable", "deferred"],
    answerType: "tax",
    data: {
      taxAdvantaged: 67,
      taxLossHarvesting: 3200,
      municipalIncome: 1800,
      effectiveTaxRate: 18.3,
      marginalTaxRate: 28,
      accountTypes: [
        { type: "401(k)", allocation: 42, strategy: "Growth focus" },
        { type: "Traditional IRA", allocation: 18, strategy: "International equity" },
        { type: "Roth IRA", allocation: 7, strategy: "High-growth positions" },
        { type: "Taxable", allocation: 33, strategy: "Municipal bonds, tax-efficient equity" }
      ]
    }
  },
  {
    id: "market-volatility",
    title: "Market Volatility Impact",
    content: "During recent market volatility, your portfolio demonstrated strong defensive characteristics with a maximum 30-day rolling volatility of 14.2% versus the S&P 500's 19.8%. The portfolio's low-volatility tilt and quality factor exposure provided downside protection during the March correction. Beta-adjusted performance shows +2.1% excess return after accounting for the portfolio's 1.08 beta, indicating genuine alpha generation beyond market exposure.",
    category: "Risk",
    keywords: ["volatility", "risk", "market", "correction", "drawdown", "beta", "alpha", "defensive"],
    answerType: "risk",
    data: {
      portfolioVolatility: 14.2,
      marketVolatility: 19.8,
      maxDrawdown: -8.2,
      recoveryDays: 42,
      beta: 1.08,
      betaAdjustedReturn: 2.1,
      riskMetrics: [
        { metric: "Volatility", portfolio: 14.2, benchmark: 19.8, advantage: "Lower" },
        { metric: "Max Drawdown", portfolio: -8.2, benchmark: -12.4, advantage: "Better" },
        { metric: "Downside Deviation", portfolio: 9.8, benchmark: 13.7, advantage: "Lower" },
        { metric: "Up Capture", portfolio: 94, benchmark: 100, advantage: "Slightly Lower" },
        { metric: "Down Capture", portfolio: 78, benchmark: 100, advantage: "Much Better" }
      ]
    }
  },
  {
    id: "factor-attribution",
    title: "Factor-Based Attribution Analysis",
    content: "Your portfolio's returns can be attributed to multiple factor exposures. Quality and Growth factors contributed +3.2% and +2.8% respectively, while the Momentum factor added +1.9%. Size factor exposure is neutral with minimal impact. Factor-based analysis reveals that 68% of returns are explained by intentional factor tilts, while 32% represents true alpha from security selection. The portfolio's quality bias has particularly benefited performance during market uncertainty.",
    category: "Performance",
    keywords: ["factor", "attribution", "analysis", "quality", "growth", "momentum", "size", "value", "style", "exposure", "tilt"],
    answerType: "performance",
    data: {
      factorContributions: [
        { factor: "Quality", contribution: 3.2, weight: 0.42, description: "High ROE and stable earnings" },
        { factor: "Growth", contribution: 2.8, weight: 0.38, description: "Revenue and earnings growth" },
        { factor: "Momentum", contribution: 1.9, weight: 0.28, description: "Price momentum signals" },
        { factor: "Value", contribution: -0.4, weight: -0.12, description: "Underweight value stocks" },
        { factor: "Size", contribution: 0.1, weight: 0.03, description: "Neutral size exposure" },
        { factor: "Low Volatility", contribution: 1.2, weight: 0.18, description: "Defensive positioning" }
      ],
      explainedReturn: 68,
      alpha: 32,
      totalAttribution: 8.8
    }
  },
  {
    id: "sharpe-ratio-analysis",
    title: "Sharpe Ratio & Risk-Adjusted Returns",
    content: "Your portfolio's Sharpe ratio of 1.34 significantly exceeds both the S&P 500 (1.12) and the average peer portfolio (0.98), indicating superior risk-adjusted returns. The Sortino ratio of 1.89 shows even stronger performance when focusing on downside risk. Information ratio of 0.67 demonstrates consistent alpha generation relative to tracking error. These metrics confirm efficient capital allocation and effective risk management.",
    category: "Risk",
    keywords: ["sharpe", "ratio", "risk-adjusted", "returns", "sortino", "information", "treynor", "calmar", "efficiency"],
    answerType: "risk",
    data: {
      sharpeRatio: 1.34,
      benchmarkSharpe: 1.12,
      peerAverageSharpe: 0.98,
      sortinoRatio: 1.89,
      informationRatio: 0.67,
      treynorRatio: 12.8,
      calmarRatio: 1.79,
      riskFreeRate: 4.5,
      excessReturn: 10.2,
      standardDeviation: 16.4
    }
  },
  {
    id: "rolling-returns",
    title: "Rolling Returns Analysis",
    content: "12-month rolling returns over the past 3 years show consistent outperformance with 89% of periods beating the S&P 500. The portfolio demonstrated resilience during the 2022 downturn with a minimum rolling return of -4.2% vs the market's -12.8%. Best rolling period achieved +24.7% return. Current 12-month return of +14.7% ranks in the 82nd percentile of the trailing 36-month distribution, indicating strong recent momentum.",
    category: "Performance",
    keywords: ["rolling", "returns", "12-month", "trailing", "periods", "consistency", "outperformance", "momentum"],
    answerType: "performance",
    data: {
      current12MonthReturn: 14.7,
      periodsOutperforming: 89,
      bestRollingPeriod: 24.7,
      worstRollingPeriod: -4.2,
      benchmarkWorst: -12.8,
      percentileRank: 82,
      rollingReturns: [
        { endDate: "2024-08", return: 14.7, benchmark: 11.2, excess: 3.5 },
        { endDate: "2024-05", return: 16.2, benchmark: 12.8, excess: 3.4 },
        { endDate: "2024-02", return: 12.4, benchmark: 10.1, excess: 2.3 },
        { endDate: "2023-11", return: 18.3, benchmark: 14.2, excess: 4.1 },
        { endDate: "2023-08", return: 9.8, benchmark: 8.4, excess: 1.4 }
      ]
    }
  },
  {
    id: "value-at-risk",
    title: "Value at Risk (VaR) Analysis",
    content: "Portfolio Value at Risk analysis indicates a 95% confidence that daily losses will not exceed -2.1% (approximately $31,500 on current AUM). The 99% VaR stands at -3.4% ($51,000), while Expected Shortfall (CVaR) at 95% confidence is -2.8%. Historical VaR over the past year has been accurate 94.2% of the time. Stress testing against 2008 crisis scenarios suggests maximum potential drawdown of -18.5%, significantly better than the market's -37.0% during that period.",
    category: "Risk",
    keywords: ["var", "value", "at", "risk", "cvar", "conditional", "expected", "shortfall", "loss", "stress", "test"],
    answerType: "risk",
    data: {
      var95Daily: -2.1,
      var95DollarAmount: 31500,
      var99Daily: -3.4,
      var99DollarAmount: 51000,
      cvar95: -2.8,
      historicalAccuracy: 94.2,
      stressScenarios: [
        { scenario: "2008 Financial Crisis", portfolioDrawdown: -18.5, marketDrawdown: -37.0 },
        { scenario: "2020 COVID Crash", portfolioDrawdown: -14.2, marketDrawdown: -19.4 },
        { scenario: "Rising Rates +200bps", portfolioDrawdown: -8.7, marketDrawdown: -11.2 },
        { scenario: "Tech Correction -25%", portfolioDrawdown: -12.3, marketDrawdown: -15.8 }
      ]
    }
  },
  {
    id: "performance-contributors",
    title: "Top Performance Contributors & Detractors",
    content: "NVIDIA leads performance contribution at +1.34% to portfolio returns, followed by Microsoft (+0.78%) and Apple (+0.51%). Technology sector overall contributed +4.2% to returns. On the downside, Energy positions detracted -0.3% and Communication Services underperformed expectations by -0.6%. Security selection in Technology added +2.1% while sector allocation contributed +1.9%. Active positions (vs benchmark) generated +3.2% of alpha this year.",
    category: "Performance",
    keywords: ["contributors", "detractors", "attribution", "top", "worst", "best", "performance", "drivers", "drag"],
    answerType: "performance",
    data: {
      topContributors: [
        { name: "NVIDIA Corp", symbol: "NVDA", contribution: 1.34, weight: 3.9, return: 34.7 },
        { name: "Microsoft Corp", symbol: "MSFT", contribution: 0.78, weight: 4.8, return: 16.2 },
        { name: "Apple Inc", symbol: "AAPL", contribution: 0.51, weight: 4.2, return: 12.4 },
        { name: "Amazon.com", symbol: "AMZN", contribution: 0.68, weight: 3.6, return: 18.9 },
        { name: "Alphabet Inc", symbol: "GOOGL", contribution: 0.52, weight: 3.4, return: 15.3 }
      ],
      topDetractors: [
        { name: "AT&T Inc", symbol: "T", contribution: -0.18, weight: 1.2, return: -15.2 },
        { name: "Chevron Corp", symbol: "CVX", contribution: -0.12, weight: 0.8, return: -14.8 },
        { name: "Verizon", symbol: "VZ", contribution: -0.14, weight: 1.0, return: -13.7 }
      ],
      sectorContribution: 4.2,
      securitySelection: 2.1,
      allocationEffect: 1.9,
      totalAlpha: 3.2
    }
  },
  {
    id: "asset-allocation",
    title: "Asset Allocation Overview",
    content: "Your portfolio maintains a strategic 75% equity / 25% fixed income allocation, with equities split between 68% US stocks, 18% international developed, and 14% emerging markets. Within fixed income, 60% is allocated to government bonds, 35% investment-grade corporate, and 5% high-yield. Alternative investments represent 8% of total portfolio via REITs (4.2%), commodities (2.3%), and private equity (1.5%). This allocation targets 60/40-style returns with enhanced diversification and reduced correlation during market stress.",
    category: "Allocation",
    keywords: ["asset", "allocation", "equity", "fixed", "income", "bonds", "stocks", "alternatives", "mix", "strategic"],
    answerType: "allocation",
    data: {
      equityAllocation: 75,
      fixedIncomeAllocation: 25,
      equityBreakdown: [
        { region: "US Stocks", allocation: 68, amount: 1020000 },
        { region: "International Developed", allocation: 18, amount: 270000 },
        { region: "Emerging Markets", allocation: 14, amount: 210000 }
      ],
      fixedIncomeBreakdown: [
        { type: "Government Bonds", allocation: 60, amount: 225000 },
        { type: "Investment Grade Corporate", allocation: 35, amount: 131250 },
        { type: "High Yield", allocation: 5, amount: 18750 }
      ],
      alternatives: 8,
      targetReturn: 8.5,
      targetVolatility: 12.5
    }
  },
  {
    id: "recent-trades",
    title: "Recent Trading Activity",
    content: "Over the past 30 days, 12 transactions were executed totaling $485,000 in volume. Notable purchases include $180K NVIDIA position increase, $85K new position in Eli Lilly, and $65K addition to Microsoft. Sales included $95K Tesla reduction, $58K profit-taking in Meta, and $42K trimming of overweight Healthcare positions. Net cash flow was +$38K, maintaining target allocation. All trades were executed within 0.05% of target prices with minimal market impact.",
    category: "Trading",
    keywords: ["recent", "trades", "trading", "activity", "transactions", "purchases", "sales", "buys", "sells", "last", "month"],
    answerType: "trading",
    data: {
      totalTransactions: 12,
      totalVolume: 485000,
      purchases: [
        { security: "NVIDIA Corp", symbol: "NVDA", amount: 180000, shares: 375, price: 480.00, date: "2024-08-15" },
        { security: "Eli Lilly", symbol: "LLY", amount: 85000, shares: 95, price: 894.74, date: "2024-08-12" },
        { security: "Microsoft Corp", symbol: "MSFT", amount: 65000, shares: 152, price: 427.63, date: "2024-08-08" }
      ],
      sales: [
        { security: "Tesla Inc", symbol: "TSLA", amount: -95000, shares: -425, price: 223.53, date: "2024-07-22" },
        { security: "Meta Platforms", symbol: "META", amount: -58000, shares: -122, price: 475.41, date: "2024-08-05" },
        { security: "UnitedHealth", symbol: "UNH", amount: -42000, shares: -78, price: 538.46, date: "2024-08-18" }
      ],
      netCashFlow: 38000,
      avgExecutionQuality: 99.95
    }
  },
  {
    id: "correlation-analysis",
    title: "Correlation & Diversification Analysis",
    content: "Portfolio correlation to the S&P 500 stands at 0.87, indicating strong but not perfect market linkage. International equity correlation is 0.72, providing meaningful diversification benefits. Fixed income maintains negative correlation (-0.18) during equity drawdowns, confirming hedge effectiveness. Intra-portfolio correlations average 0.42, suggesting good diversification. The portfolio's effective number of bets is 18.3, well above the market's typical 8-10, indicating superior risk distribution across uncorrelated sources of return.",
    category: "Risk",
    keywords: ["correlation", "diversification", "relationship", "link", "covariance", "independent", "uncorrelated"],
    answerType: "risk",
    data: {
      marketCorrelation: 0.87,
      internationalCorrelation: 0.72,
      bondCorrelation: -0.18,
      avgIntraCorrelation: 0.42,
      effectiveBets: 18.3,
      marketEffectiveBets: 9.2,
      assetClassCorrelations: [
        { class1: "US Equity", class2: "Intl Equity", correlation: 0.78 },
        { class1: "US Equity", class2: "Bonds", correlation: -0.18 },
        { class1: "US Equity", class2: "REITs", correlation: 0.65 },
        { class1: "Bonds", class2: "Gold", correlation: -0.12 }
      ]
    }
  },
  {
    id: "dividend-growth",
    title: "Dividend Growth Analysis",
    content: "23 holdings are Dividend Aristocrats with 25+ years of consecutive dividend increases. Your dividend income has grown at a compound annual rate of 9.8% over the past 5 years, outpacing inflation by 6.3%. Microsoft, Johnson & Johnson, and Procter & Gamble lead dividend growth at 10.2%, 6.4%, and 5.8% respectively. Forward-looking dividend growth rate is projected at 8.2% annually, supported by payout ratios averaging 52% and strong free cash flow generation. The portfolio is positioned for sustainable income growth without sacrificing capital appreciation.",
    category: "Income",
    keywords: ["dividend", "growth", "aristocrats", "growing", "increase", "raise", "compound", "cagr"],
    answerType: "dividend",
    data: {
      aristocrats: 23,
      dividendCAGR5yr: 9.8,
      inflationAdjustedGrowth: 6.3,
      forwardGrowthRate: 8.2,
      avgPayoutRatio: 52,
      sustainabilityScore: 8.4,
      topGrowthStocks: [
        { name: "Microsoft", symbol: "MSFT", growthRate: 10.2, payoutRatio: 26, yearsGrowth: 19 },
        { name: "Apple", symbol: "AAPL", growthRate: 7.8, payoutRatio: 15, yearsGrowth: 12 },
        { name: "Visa", symbol: "V", growthRate: 18.3, payoutRatio: 23, yearsGrowth: 14 },
        { name: "Johnson & Johnson", symbol: "JNJ", growthRate: 6.4, payoutRatio: 47, yearsGrowth: 61 },
        { name: "Procter & Gamble", symbol: "PG", growthRate: 5.8, payoutRatio: 63, yearsGrowth: 67 }
      ]
    }
  }
];

// Question matching service
class QuestionMatchingService {
  async findBestMatch(question: string, placeholders?: Record<string, string>): Promise<{ answer: any; confidence: "high" | "medium" | "low" } | null> {
    const answers = mockAnswers;
    let processedQuestion = question.toLowerCase();

    // Replace placeholders with actual values for better matching
    if (placeholders) {
      for (const [key, value] of Object.entries(placeholders)) {
        const placeholderPattern = new RegExp(`\\{${key}\\}`, 'gi');
        processedQuestion = processedQuestion.replace(placeholderPattern, value.toLowerCase());
      }
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const answer of answers) {
      let score = 0;
      const keywords = answer.keywords || [];

      // Check exact phrase matches (higher weight)
      if (answer.title.toLowerCase().includes(processedQuestion)) {
        score += 100;
      }

      // Check keyword matches
      for (const keyword of keywords) {
        if (processedQuestion.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Check category matches
      if (answer.category && processedQuestion.includes(answer.category.toLowerCase())) {
        score += 20;
      }

      // Additional scoring for answer type matches
      if (answer.answerType && processedQuestion.includes(answer.answerType.toLowerCase())) {
        score += 15;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = answer;
      }
    }

    if (!bestMatch || highestScore < 10) {
      return null;
    }

    // Determine confidence based on score
    let confidence: "high" | "medium" | "low" = "low";
    if (highestScore >= 50) confidence = "high";
    else if (highestScore >= 25) confidence = "medium";

    return { answer: bestMatch, confidence };
  }

  // Classify unmatched questions for better fallback responses
  classifyQuestion(question: string): { type: "personal" | "market" | "financial_advice" | "portfolio"; message: string; actionText?: string } {
    const questionLower = question.toLowerCase();

    // Personal/Account Information
    const personalKeywords = ["name", "address", "phone", "email", "advisor", "contact", "who am i", "my information", "account details"];
    if (personalKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "personal",
        message: "I can help with portfolio analysis, but I don't have access to personal account information. You can find your account details in the main dashboard or contact your advisor directly.",
        actionText: "View Account Details"
      };
    }

    // Market Data / External Information
    const marketKeywords = ["stock price", "market news", "interest rates", "fed", "inflation", "earnings", "when will", "what will happen"];
    if (marketKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "market",
        message: "I specialize in your portfolio analysis. For real-time market data or economic forecasts, I'd recommend checking your trading platform or financial news sources.",
        actionText: "Open Market Data"
      };
    }

    // Financial Advice
    const adviceKeywords = ["should i", "what should", "recommend", "advice", "strategy", "buy", "sell", "rebalance", "allocate"];
    if (adviceKeywords.some(keyword => questionLower.includes(keyword))) {
      return {
        type: "financial_advice",
        message: "This is a great question for personalized advice. I've added it to your advisor's review queue for detailed analysis. You should receive a response within 24 hours.",
        actionText: "Track Review Status"
      };
    }

    // Default: Portfolio-related but not in our database
    return {
      type: "portfolio",
      message: "I don't have specific data for this portfolio question yet. I've added it to our development queue to enhance my capabilities. Meanwhile, your advisor can provide detailed insights.",
      actionText: "Contact Advisor"
    };
  }
}

const questionMatcher = new QuestionMatchingService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = questionRequestSchema.parse(req.body);

    // Try to find a matching answer (with placeholder support)
    const match = await questionMatcher.findBestMatch(validatedData.question, validatedData.placeholders);

    if (match) {
      // Found a match - return matched response
      const response: QuestionResponse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "matched",
        answer: {
          id: match.answer.id,
          title: match.answer.title,
          content: match.answer.content,
          category: match.answer.category,
          answerType: match.answer.answerType,
          data: match.answer.data,
        },
        confidence: match.confidence,
        message: `Found ${match.confidence} confidence match`,
      };

      return res.status(200).json(response);
    } else {
      // No match found - classify question for smart fallback
      const classification = questionMatcher.classifyQuestion(validatedData.question);

      // Update status based on classification
      const status = classification.type === "financial_advice" ? "review" : "no_match";

      const response: QuestionResponse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: status as "matched" | "review" | "no_match",
        message: classification.message,
        answer: classification.type !== "financial_advice" ? {
          id: `fallback-${classification.type}`,
          title: classification.type === "personal" ? "Account Information" :
                 classification.type === "market" ? "Market Data" :
                 "Portfolio Analysis",
          content: classification.message,
          category: "Fallback",
          answerType: classification.type,
          data: {
            fallbackType: classification.type,
            actionText: classification.actionText,
            isUnmatched: true
          }
        } : undefined
      };

      return res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error processing question:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request format',
        details: error.errors
      });
    }

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
