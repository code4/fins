// Content generator that creates varied UI presentations based on answer data
export interface GeneratedContent {
  paragraph?: string;
  kpis?: Array<{
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
  }>;
  chartData?: any[];
  tableData?: any[];
  highlights?: string[];
  metrics?: Array<{
    label: string;
    value: string;
    subtext?: string;
  }>;
}

export class ContentGenerator {
  static generateContent(answer: any): GeneratedContent {
    if (!answer.data) {
      return {
        paragraph: answer.content
      };
    }

    const { answerType, data } = answer;

    switch (answerType) {
      case 'performance':
        return this.generatePerformanceContent(data);
      
      case 'holdings':
        return this.generateHoldingsContent(data);
      
      case 'risk':
        return this.generateRiskContent(data);
      
      case 'allocation':
        return this.generateAllocationContent(data);
      
      case 'dividend':
        return this.generateDividendContent(data);
      
      case 'trading':
        return this.generateTradingContent(data);
      
      case 'esg':
        return this.generateESGContent(data);

      case 'costs':
        return this.generateCostsContent(data);

      case 'geographic':
        return this.generateGeographicContent(data);

      case 'fixed_income':
        return this.generateFixedIncomeContent(data);

      case 'alternatives':
        return this.generateAlternativesContent(data);

      case 'tax':
        return this.generateTaxContent(data);

      default:
        return {
          paragraph: answer.content
        };
    }
  }

  private static generatePerformanceContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "YTD Return",
          value: `+${data.portfolioReturn}%`,
          change: `+${data.outperformance}% vs S&P`,
          isPositive: data.outperformance > 0
        },
        {
          label: "Sharpe Ratio",
          value: data.sharpeRatio.toString(),
          change: `vs ${data.benchmarkSharpe} benchmark`,
          isPositive: data.sharpeRatio > data.benchmarkSharpe
        },
        {
          label: "S&P 500 Return",
          value: `+${data.benchmarkReturn}%`,
          change: "Benchmark performance",
          isPositive: data.benchmarkReturn > 0
        },
        {
          label: "Outperformance",
          value: `+${data.outperformance}%`,
          change: "Above benchmark",
          isPositive: true
        }
      ],
      chartData: data.chartData,
      highlights: [
        `Portfolio outperformed S&P 500 by ${data.outperformance} percentage points`,
        `Top contributing sectors: ${data.topContributors.join(', ')}`,
        `Risk-adjusted returns superior with Sharpe ratio of ${data.sharpeRatio}`
      ]
    };
  }

  private static generateHoldingsContent(data: any): GeneratedContent {
    const topHoldings = data.topHoldings.slice(0, 6);
    
    return {
      kpis: [
        {
          label: "Top 10 Weight",
          value: `${data.totalWeight}%`,
          change: "of portfolio",
          isPositive: true
        },
        {
          label: "Average P/E",
          value: `${data.avgPE}x`,
          change: "Quality growth",
          isPositive: true
        },
        {
          label: "Contribution",
          value: `+${data.contribution}%`,
          change: "to performance",
          isPositive: true
        },
        {
          label: "Holdings Count",
          value: "10",
          change: "Top positions",
          isPositive: true
        }
      ],
      tableData: topHoldings.map((holding: any) => ({
        name: holding.name,
        symbol: holding.symbol,
        weight: `${holding.weight}%`,
        return: `${holding.return > 0 ? '+' : ''}${holding.return}%`,
        sector: holding.sector,
        isPositive: holding.return > 0
      })),
      highlights: [
        `Top holding: ${topHoldings[0].name} at ${topHoldings[0].weight}%`,
        `Technology represents ${topHoldings.filter((h: any) => h.sector === 'Technology').length} of top 10`,
        `Best performer: ${topHoldings.reduce((best: any, current: any) => current.return > best.return ? current : best).name} (+${topHoldings.reduce((best: any, current: any) => current.return > best.return ? current : best).return}%)`
      ]
    };
  }

  private static generateRiskContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Portfolio Beta",
          value: data.beta.toString(),
          change: `vs market 1.0`,
          isPositive: data.beta < 1.2
        },
        {
          label: "Volatility",
          value: `${data.volatility}%`,
          change: `vs ${data.marketVolatility}% market`,
          isPositive: data.volatility < data.marketVolatility
        },
        {
          label: "Max Drawdown",
          value: `${data.maxDrawdown}%`,
          change: "12-month worst",
          isPositive: data.maxDrawdown > -15
        },
        {
          label: "Value at Risk",
          value: `${data.var95}%`,
          change: "95% confidence",
          isPositive: data.var95 > -5
        },
        {
          label: "Sharpe Ratio",
          value: data.sharpeRatio.toString(),
          change: "Risk-adj return",
          isPositive: data.sharpeRatio > 1
        },
        {
          label: "Information Ratio",
          value: data.informationRatio.toString(),
          change: `TE: ${data.trackingError}%`,
          isPositive: data.informationRatio > 0
        }
      ],
      metrics: [
        { label: "Sortino Ratio", value: data.sortinoRatio.toString(), subtext: "Downside risk focus" },
        { label: "Market Correlation", value: data.correlationToMarket.toString(), subtext: "Diversification measure" }
      ]
    };
  }

  private static generateAllocationContent(data: any): GeneratedContent {
    const topSectors = data.sectors.slice(0, 6);
    
    return {
      kpis: [
        {
          label: "Excess Return",
          value: `+${data.excessReturn}%`,
          change: "from allocation",
          isPositive: data.excessReturn > 0
        },
        {
          label: "Technology",
          value: `${data.sectors[0].portfolio}%`,
          change: `+${data.sectors[0].excess}% vs S&P`,
          isPositive: data.sectors[0].excess > 0
        },
        {
          label: "Healthcare",
          value: `${data.sectors[1].portfolio}%`,
          change: `+${data.sectors[1].excess}% vs S&P`,
          isPositive: data.sectors[1].excess > 0
        },
        {
          label: "Top Sector Return",
          value: `+${Math.max(...data.sectors.map((s: any) => s.return))}%`,
          change: "Best performing",
          isPositive: true
        }
      ],
      chartData: topSectors.map((sector: any) => ({
        sector: sector.name,
        portfolio: sector.portfolio,
        benchmark: sector.benchmark,
        excess: sector.excess
      })),
      tableData: topSectors.map((sector: any) => ({
        name: sector.name,
        portfolio: `${sector.portfolio}%`,
        benchmark: `${sector.benchmark}%`,
        excess: `${sector.excess > 0 ? '+' : ''}${sector.excess}%`,
        return: `+${sector.return}%`,
        isPositive: sector.excess > 0
      }))
    };
  }

  private static generateDividendContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Portfolio Yield",
          value: `${data.currentYield}%`,
          change: `vs ${data.benchmarkYield}% S&P`,
          isPositive: data.currentYield > data.benchmarkYield
        },
        {
          label: "Annual Income",
          value: `$${(data.annualIncome / 1000).toFixed(0)}K`,
          change: `+${data.incomeGrowth}% YoY`,
          isPositive: data.incomeGrowth > 0
        },
        {
          label: "Dividend Stocks",
          value: data.dividendStocks.toString(),
          change: `${data.aristocrats} aristocrats`,
          isPositive: true
        },
        {
          label: "Growth Rate",
          value: `${data.forwardGrowth}%`,
          change: "Forward outlook",
          isPositive: data.forwardGrowth > 5
        }
      ],
      tableData: data.topDividendStocks.map((stock: any) => ({
        name: stock.name,
        yield: `${stock.yield}%`,
        payment: `$${stock.payment.toLocaleString()}`,
        isPositive: stock.yield > 2
      })),
      metrics: [
        { label: "Average Payout Ratio", value: `${data.avgPayoutRatio}%`, subtext: "Sustainable levels" }
      ]
    };
  }

  private static generateTradingContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Turnover Rate",
          value: `${data.turnoverRate}%`,
          change: "Annual activity",
          isPositive: data.turnoverRate < 50
        },
        {
          label: "Total Volume",
          value: `$${(data.totalVolume / 1000000).toFixed(1)}M`,
          change: `${data.transactionCount} trades`,
          isPositive: true
        },
        {
          label: "Avg Holding",
          value: `${data.avgHoldingPeriod}m`,
          change: "months",
          isPositive: data.avgHoldingPeriod > 6
        },
        {
          label: "Transaction Cost",
          value: `${data.transactionCost}%`,
          change: "of trade value",
          isPositive: data.transactionCost < 0.1
        }
      ],
      tableData: data.majorTrades.map((trade: any) => ({
        type: trade.type,
        security: trade.security,
        amount: `${trade.amount < 0 ? '-' : ''}$${Math.abs(trade.amount / 1000)}K`,
        impact: `${trade.impact > 0 ? '+' : ''}${trade.impact}%`,
        date: new Date(trade.date).toLocaleDateString(),
        isPositive: trade.type === 'Buy'
      }))
    };
  }

  private static generateESGContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "ESG Score",
          value: data.overallScore.toString(),
          change: `${data.rating} Rating`,
          isPositive: data.overallScore > 7
        },
        {
          label: "vs S&P 500",
          value: `+${(data.overallScore - data.benchmarkScore).toFixed(1)}`,
          change: "Above benchmark",
          isPositive: data.overallScore > data.benchmarkScore
        },
        {
          label: "Carbon Intensity",
          value: `${data.carbonIntensity}`,
          change: `${data.carbonReduction}% lower`,
          isPositive: true
        },
        {
          label: "Sustainable Rev",
          value: `${data.sustainableRevenue}%`,
          change: "of portfolio",
          isPositive: data.sustainableRevenue > 25
        }
      ],
      metrics: [
        { label: "Environmental", value: data.environmentalScore.toString(), subtext: "Clean energy focus" },
        { label: "Social", value: data.socialScore.toString(), subtext: "Responsible practices" },
        { label: "Governance", value: data.governanceScore.toString(), subtext: "Corporate quality" }
      ],
      chartData: [
        { category: "Environmental", portfolio: data.environmentalScore, benchmark: 6.0 },
        { category: "Social", portfolio: data.socialScore, benchmark: 6.1 },
        { category: "Governance", portfolio: data.governanceScore, benchmark: 6.5 }
      ]
    };
  }

  private static generateCostsContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Avg Expense Ratio",
          value: `${data.avgExpenseRatio}%`,
          change: `vs ${data.industryAverage}% industry`,
          isPositive: data.avgExpenseRatio < data.industryAverage
        },
        {
          label: "Annual Fees",
          value: `$${(data.totalAnnualFees / 1000).toFixed(1)}K`,
          change: "Total cost",
          isPositive: data.totalAnnualFees < 10000
        },
        {
          label: "Index Funds",
          value: `${data.indexAllocation}%`,
          change: `${data.indexFundRatio}% avg fee`,
          isPositive: true
        },
        {
          label: "Active Funds",
          value: `${data.activeAllocation}%`,
          change: `${data.activeFundRatio}% avg fee`,
          isPositive: data.activeFundRatio < 1
        }
      ],
      tableData: data.costBreakdown?.map((item: any) => ({
        type: item.type,
        allocation: `${item.allocation}%`,
        avgFee: `${item.avgFee}%`,
        totalCost: `$${item.totalCost.toLocaleString()}`,
        isPositive: item.avgFee < 0.5
      }))
    };
  }

  private static generateGeographicContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "US Exposure",
          value: `${data.usExposure}%`,
          change: "Domestic equity",
          isPositive: true
        },
        {
          label: "Developed Intl",
          value: `${data.developedIntl}%`,
          change: "International",
          isPositive: true
        },
        {
          label: "Emerging Markets",
          value: `${data.emergingMarkets}%`,
          change: "Growth exposure",
          isPositive: true
        },
        {
          label: "Currency Hedged",
          value: `${data.currencyHedged}%`,
          change: "FX protection",
          isPositive: data.currencyHedged > 50
        }
      ],
      tableData: data.topIntlHoldings?.map((holding: any) => ({
        name: holding.name,
        country: holding.country,
        weight: `${holding.weight}%`,
        sector: holding.sector,
        isPositive: true
      })),
      highlights: [
        `European holdings: ${data.europeanHoldings}% of portfolio`,
        `Asia-Pacific exposure: ${data.asiaPacific}%`,
        `Currency hedging on ${data.currencyHedged}% of international positions`
      ]
    };
  }

  private static generateFixedIncomeContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Fixed Income",
          value: `${data.fixedIncomeAllocation}%`,
          change: "of portfolio",
          isPositive: true
        },
        {
          label: "Duration",
          value: `${data.duration}y`,
          change: "Interest rate risk",
          isPositive: data.duration < 7
        },
        {
          label: "Current Yield",
          value: `${data.currentYield}%`,
          change: `$${(data.annualIncome / 1000).toFixed(1)}K annual`,
          isPositive: data.currentYield > 4
        },
        {
          label: "Credit Quality",
          value: data.averageCredit,
          change: "High quality",
          isPositive: true
        }
      ],
      tableData: data.maturityLadder?.map((item: any) => ({
        year: item.year,
        allocation: `${item.allocation}%`,
        yield: `${item.yield}%`,
        isPositive: item.yield > 4
      })),
      highlights: [
        `Government bonds: ${data.governmentBonds}% of fixed income`,
        `Corporate IG: ${data.corporateIG}%, High Yield: ${data.highYield}%`,
        `Laddered maturities from 2025 to 2034`
      ]
    };
  }

  private static generateAlternativesContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Total Alternatives",
          value: `${data.totalAlternatives}%`,
          change: "of portfolio",
          isPositive: true
        },
        {
          label: "REITs",
          value: `${data.reitAllocation}%`,
          change: `+${data.reitReturn}% YTD`,
          isPositive: data.reitReturn > 0
        },
        {
          label: "Commodities",
          value: `${data.commoditiesAllocation}%`,
          change: "Inflation hedge",
          isPositive: true
        },
        {
          label: "Private Equity",
          value: `${data.privateEquityAllocation}%`,
          change: "Growth exposure",
          isPositive: true
        }
      ],
      tableData: data.alternativeBreakdown?.map((item: any) => ({
        type: item.type,
        allocation: `${item.allocation}%`,
        return: `${item.return > 0 ? '+' : ''}${item.return}%`,
        income: `${item.income}%`,
        isPositive: item.return > 0
      })),
      highlights: [
        `Alternatives contributed +${data.performanceContribution}% to portfolio performance`,
        `Real estate exposure provides inflation protection`,
        `Diversification benefits from low correlation assets`
      ]
    };
  }

  private static generateTaxContent(data: any): GeneratedContent {
    return {
      kpis: [
        {
          label: "Tax-Advantaged",
          value: `${data.taxAdvantaged}%`,
          change: "IRA/401k holdings",
          isPositive: data.taxAdvantaged > 50
        },
        {
          label: "Effective Tax Rate",
          value: `${data.effectiveTaxRate}%`,
          change: `vs ${data.marginalTaxRate}% marginal`,
          isPositive: data.effectiveTaxRate < data.marginalTaxRate
        },
        {
          label: "Tax-Loss Harvesting",
          value: `$${(data.taxLossHarvesting / 1000).toFixed(1)}K`,
          change: "Realized losses",
          isPositive: data.taxLossHarvesting > 0
        },
        {
          label: "Muni Income",
          value: `$${(data.municipalIncome / 1000).toFixed(1)}K`,
          change: "Tax-free annually",
          isPositive: true
        }
      ],
      tableData: data.accountTypes?.map((account: any) => ({
        type: account.type,
        allocation: `${account.allocation}%`,
        strategy: account.strategy,
        isPositive: true
      })),
      highlights: [
        `Effective tax rate ${data.marginalTaxRate - data.effectiveTaxRate}% below marginal rate`,
        `Strategic asset location optimizes tax efficiency`,
        `Tax-loss harvesting generated $${data.taxLossHarvesting.toLocaleString()} in deductions`
      ]
    };
  }
}