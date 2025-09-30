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
    // Handle factor attribution
    if (data.factorContributions) {
      return {
        kpis: [
          {
            label: "Explained Return",
            value: `${data.explainedReturn}%`,
            change: "Factor-based",
            isPositive: true
          },
          {
            label: "True Alpha",
            value: `${data.alpha}%`,
            change: "Security selection",
            isPositive: data.alpha > 0
          },
          {
            label: "Total Attribution",
            value: `+${data.totalAttribution}%`,
            change: "Combined factors",
            isPositive: true
          },
          {
            label: "Top Factor",
            value: data.factorContributions[0].factor,
            change: `+${data.factorContributions[0].contribution}%`,
            isPositive: true
          }
        ],
        tableData: data.factorContributions.map((factor: any) => ({
          factor: factor.factor,
          contribution: `${factor.contribution > 0 ? '+' : ''}${factor.contribution}%`,
          weight: factor.weight.toFixed(2),
          description: factor.description,
          isPositive: factor.contribution > 0
        })),
        highlights: [
          `${data.explainedReturn}% of returns explained by intentional factor tilts`,
          `${data.alpha}% represents true alpha from security selection`,
          `${data.factorContributions[0].factor} factor contributed most at +${data.factorContributions[0].contribution}%`
        ]
      };
    }

    // Handle rolling returns
    if (data.rollingReturns) {
      return {
        kpis: [
          {
            label: "Current 12M Return",
            value: `+${data.current12MonthReturn}%`,
            change: `${data.percentileRank}th percentile`,
            isPositive: true
          },
          {
            label: "Outperforming Periods",
            value: `${data.periodsOutperforming}%`,
            change: "Beat S&P 500",
            isPositive: data.periodsOutperforming > 75
          },
          {
            label: "Best Period",
            value: `+${data.bestRollingPeriod}%`,
            change: "Peak performance",
            isPositive: true
          },
          {
            label: "Worst Period",
            value: `${data.worstRollingPeriod}%`,
            change: `vs ${data.benchmarkWorst}% S&P`,
            isPositive: data.worstRollingPeriod > data.benchmarkWorst
          }
        ],
        chartData: data.rollingReturns.map((period: any) => ({
          date: period.endDate,
          portfolio: period.return,
          benchmark: period.benchmark,
          excess: period.excess
        })),
        highlights: [
          `${data.periodsOutperforming}% of rolling periods outperformed S&P 500`,
          `Demonstrated resilience with minimum return of ${data.worstRollingPeriod}% vs market's ${data.benchmarkWorst}%`,
          `Current 12-month return ranks in ${data.percentileRank}th percentile`
        ]
      };
    }

    // Handle performance contributors
    if (data.topContributors && Array.isArray(data.topContributors) && data.topContributors[0].symbol) {
      return {
        kpis: [
          {
            label: "Sector Contribution",
            value: `+${data.sectorContribution}%`,
            change: "From sectors",
            isPositive: true
          },
          {
            label: "Security Selection",
            value: `+${data.securitySelection}%`,
            change: "Stock picking",
            isPositive: data.securitySelection > 0
          },
          {
            label: "Allocation Effect",
            value: `+${data.allocationEffect}%`,
            change: "Positioning",
            isPositive: data.allocationEffect > 0
          },
          {
            label: "Total Alpha",
            value: `+${data.totalAlpha}%`,
            change: "Active return",
            isPositive: true
          }
        ],
        tableData: [
          ...data.topContributors.slice(0, 5).map((stock: any) => ({
            name: stock.name,
            symbol: stock.symbol,
            contribution: `+${stock.contribution}%`,
            weight: `${stock.weight}%`,
            return: `+${stock.return}%`,
            isPositive: true
          })),
          ...data.topDetractors.map((stock: any) => ({
            name: stock.name,
            symbol: stock.symbol,
            contribution: `${stock.contribution}%`,
            weight: `${stock.weight}%`,
            return: `${stock.return}%`,
            isPositive: false
          }))
        ],
        highlights: [
          `${data.topContributors[0].name} led contribution at +${data.topContributors[0].contribution}%`,
          `Security selection in Technology added +${data.securitySelection}%`,
          `Active positions generated +${data.totalAlpha}% of alpha`
        ]
      };
    }

    // Default: YTD performance
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
          value: data.sharpeRatio?.toString() || "N/A",
          change: data.benchmarkSharpe ? `vs ${data.benchmarkSharpe} benchmark` : "",
          isPositive: data.sharpeRatio > (data.benchmarkSharpe || 0)
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
      highlights: data.topContributors ? [
        `Portfolio outperformed S&P 500 by ${data.outperformance} percentage points`,
        `Top contributing sectors: ${data.topContributors.join(', ')}`,
        `Risk-adjusted returns superior with Sharpe ratio of ${data.sharpeRatio}`
      ] : []
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
    // Handle Sharpe ratio analysis
    if (data.sortinoRatio && data.treynorRatio && data.calmarRatio) {
      return {
        kpis: [
          {
            label: "Sharpe Ratio",
            value: data.sharpeRatio.toString(),
            change: `vs ${data.benchmarkSharpe} S&P`,
            isPositive: data.sharpeRatio > data.benchmarkSharpe
          },
          {
            label: "Sortino Ratio",
            value: data.sortinoRatio.toString(),
            change: "Downside focus",
            isPositive: data.sortinoRatio > 1.5
          },
          {
            label: "Information Ratio",
            value: data.informationRatio.toString(),
            change: "Alpha consistency",
            isPositive: data.informationRatio > 0.5
          },
          {
            label: "Peer Average",
            value: data.peerAverageSharpe.toString(),
            change: "Comparison",
            isPositive: false
          }
        ],
        metrics: [
          { label: "Treynor Ratio", value: data.treynorRatio.toString(), subtext: "Risk-adjusted vs beta" },
          { label: "Calmar Ratio", value: data.calmarRatio.toString(), subtext: "Return vs drawdown" },
          { label: "Excess Return", value: `${data.excessReturn}%`, subtext: "Above risk-free rate" },
          { label: "Std Deviation", value: `${data.standardDeviation}%`, subtext: "Volatility measure" }
        ],
        highlights: [
          `Sharpe ratio of ${data.sharpeRatio} exceeds S&P 500 (${data.benchmarkSharpe}) and peers (${data.peerAverageSharpe})`,
          `Sortino ratio of ${data.sortinoRatio} shows strong downside risk management`,
          `Information ratio of ${data.informationRatio} demonstrates consistent alpha generation`
        ]
      };
    }

    // Handle VaR analysis
    if (data.var95Daily && data.stressScenarios) {
      return {
        kpis: [
          {
            label: "VaR (95%)",
            value: `${data.var95Daily}%`,
            change: `$${(data.var95DollarAmount / 1000).toFixed(0)}K`,
            isPositive: data.var95Daily > -3
          },
          {
            label: "VaR (99%)",
            value: `${data.var99Daily}%`,
            change: `$${(data.var99DollarAmount / 1000).toFixed(0)}K`,
            isPositive: data.var99Daily > -5
          },
          {
            label: "CVaR (95%)",
            value: `${data.cvar95}%`,
            change: "Expected shortfall",
            isPositive: data.cvar95 > -4
          },
          {
            label: "Model Accuracy",
            value: `${data.historicalAccuracy}%`,
            change: "Backtest results",
            isPositive: data.historicalAccuracy > 90
          }
        ],
        tableData: data.stressScenarios.map((scenario: any) => ({
          scenario: scenario.scenario,
          portfolioDrawdown: `${scenario.portfolioDrawdown}%`,
          marketDrawdown: `${scenario.marketDrawdown}%`,
          isPositive: scenario.portfolioDrawdown > scenario.marketDrawdown
        })),
        highlights: [
          `95% confidence daily losses won't exceed ${data.var95Daily}%`,
          `Stress testing shows maximum potential drawdown of -18.5% vs market's -37%`,
          `Model accuracy of ${data.historicalAccuracy}% validates risk estimates`
        ]
      };
    }

    // Handle correlation analysis
    if (data.marketCorrelation && data.effectiveBets) {
      return {
        kpis: [
          {
            label: "Market Correlation",
            value: data.marketCorrelation.toString(),
            change: "S&P 500 linkage",
            isPositive: data.marketCorrelation < 0.9
          },
          {
            label: "Effective Bets",
            value: data.effectiveBets.toString(),
            change: `vs ${data.marketEffectiveBets} market`,
            isPositive: data.effectiveBets > data.marketEffectiveBets
          },
          {
            label: "Intl Correlation",
            value: data.internationalCorrelation.toString(),
            change: "Diversification",
            isPositive: data.internationalCorrelation < 0.8
          },
          {
            label: "Bond Correlation",
            value: data.bondCorrelation.toString(),
            change: "Hedge effectiveness",
            isPositive: data.bondCorrelation < 0
          }
        ],
        tableData: data.assetClassCorrelations?.map((corr: any) => ({
          class1: corr.class1,
          class2: corr.class2,
          correlation: corr.correlation.toFixed(2),
          isPositive: Math.abs(corr.correlation) < 0.7
        })),
        metrics: [
          { label: "Avg Intra-Correlation", value: data.avgIntraCorrelation.toString(), subtext: "Within portfolio" }
        ],
        highlights: [
          `Portfolio's ${data.effectiveBets} effective bets exceed market's typical ${data.marketEffectiveBets}`,
          `Bonds maintain negative correlation (${data.bondCorrelation}) providing hedge during drawdowns`,
          `Average intra-portfolio correlation of ${data.avgIntraCorrelation} suggests good diversification`
        ]
      };
    }

    // Default: Basic risk metrics
    return {
      kpis: [
        {
          label: "Portfolio Beta",
          value: data.beta?.toString() || "N/A",
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
          value: data.sharpeRatio?.toString() || "N/A",
          change: "Risk-adj return",
          isPositive: data.sharpeRatio > 1
        },
        {
          label: "Information Ratio",
          value: data.informationRatio?.toString() || "N/A",
          change: data.trackingError ? `TE: ${data.trackingError}%` : "",
          isPositive: data.informationRatio > 0
        }
      ],
      metrics: data.sortinoRatio ? [
        { label: "Sortino Ratio", value: data.sortinoRatio.toString(), subtext: "Downside risk focus" },
        { label: "Market Correlation", value: data.correlationToMarket?.toString() || "N/A", subtext: "Diversification measure" }
      ] : []
    };
  }

  private static generateAllocationContent(data: any): GeneratedContent {
    // Handle asset allocation overview
    if (data.equityAllocation && data.fixedIncomeAllocation) {
      return {
        kpis: [
          {
            label: "Equity Allocation",
            value: `${data.equityAllocation}%`,
            change: "Growth focus",
            isPositive: true
          },
          {
            label: "Fixed Income",
            value: `${data.fixedIncomeAllocation}%`,
            change: "Stability",
            isPositive: true
          },
          {
            label: "Alternatives",
            value: `${data.alternatives}%`,
            change: "Diversification",
            isPositive: true
          },
          {
            label: "Target Return",
            value: `${data.targetReturn}%`,
            change: "Annualized",
            isPositive: true
          }
        ],
        tableData: [
          ...data.equityBreakdown.map((item: any) => ({
            region: item.region,
            allocation: `${item.allocation}%`,
            amount: `$${(item.amount / 1000).toFixed(0)}K`,
            type: "Equity",
            isPositive: true
          })),
          ...data.fixedIncomeBreakdown.map((item: any) => ({
            region: item.type,
            allocation: `${item.allocation}%`,
            amount: `$${(item.amount / 1000).toFixed(0)}K`,
            type: "Fixed Income",
            isPositive: true
          }))
        ],
        highlights: [
          `Strategic 75/25 equity/fixed income allocation`,
          `Equities split: ${data.equityBreakdown[0].allocation}% US, ${data.equityBreakdown[1].allocation}% Intl Developed, ${data.equityBreakdown[2].allocation}% EM`,
          `Target return of ${data.targetReturn}% with ${data.targetVolatility}% volatility`
        ]
      };
    }

    const topSectors = data.sectors?.slice(0, 6) || [];
    
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
    // Handle dividend growth analysis
    if (data.dividendCAGR5yr && data.topGrowthStocks) {
      return {
        kpis: [
          {
            label: "Aristocrats",
            value: data.aristocrats.toString(),
            change: "25+ year growth",
            isPositive: true
          },
          {
            label: "5-Year CAGR",
            value: `${data.dividendCAGR5yr}%`,
            change: "Income growth",
            isPositive: data.dividendCAGR5yr > 5
          },
          {
            label: "Inflation-Adjusted",
            value: `${data.inflationAdjustedGrowth}%`,
            change: "Real growth",
            isPositive: data.inflationAdjustedGrowth > 0
          },
          {
            label: "Forward Growth",
            value: `${data.forwardGrowthRate}%`,
            change: "Projected annually",
            isPositive: data.forwardGrowthRate > 5
          }
        ],
        tableData: data.topGrowthStocks.map((stock: any) => ({
          name: stock.name,
          symbol: stock.symbol,
          growthRate: `${stock.growthRate}%`,
          payoutRatio: `${stock.payoutRatio}%`,
          yearsGrowth: `${stock.yearsGrowth} years`,
          isPositive: stock.growthRate > 5
        })),
        metrics: [
          { label: "Avg Payout Ratio", value: `${data.avgPayoutRatio}%`, subtext: "Sustainable levels" },
          { label: "Sustainability Score", value: data.sustainabilityScore.toString(), subtext: "Out of 10" }
        ],
        highlights: [
          `${data.aristocrats} Dividend Aristocrats with 25+ years of consecutive increases`,
          `Dividend income CAGR of ${data.dividendCAGR5yr}% outpaced inflation by ${data.inflationAdjustedGrowth}%`,
          `Forward growth rate of ${data.forwardGrowthRate}% supported by ${data.avgPayoutRatio}% payout ratio`
        ]
      };
    }

    // Default: Dividend income analysis
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
      tableData: data.topDividendStocks?.map((stock: any) => ({
        name: stock.name,
        yield: `${stock.yield}%`,
        payment: `$${stock.payment.toLocaleString()}`,
        isPositive: stock.yield > 2
      })) || [],
      metrics: [
        { label: "Average Payout Ratio", value: `${data.avgPayoutRatio}%`, subtext: "Sustainable levels" }
      ]
    };
  }

  private static generateTradingContent(data: any): GeneratedContent {
    // Handle recent trades (last 30 days)
    if (data.purchases && data.sales && data.totalTransactions) {
      const allTrades = [
        ...data.purchases.map((trade: any) => ({
          ...trade,
          type: 'Buy',
          amount: trade.amount
        })),
        ...data.sales.map((trade: any) => ({
          ...trade,
          type: 'Sell',
          amount: trade.amount
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        kpis: [
          {
            label: "Total Transactions",
            value: data.totalTransactions.toString(),
            change: "Last 30 days",
            isPositive: true
          },
          {
            label: "Total Volume",
            value: `$${(data.totalVolume / 1000).toFixed(0)}K`,
            change: "Traded",
            isPositive: true
          },
          {
            label: "Net Cash Flow",
            value: `${data.netCashFlow > 0 ? '+' : ''}$${(data.netCashFlow / 1000).toFixed(0)}K`,
            change: "Position change",
            isPositive: data.netCashFlow > 0
          },
          {
            label: "Execution Quality",
            value: `${data.avgExecutionQuality}%`,
            change: "vs target prices",
            isPositive: data.avgExecutionQuality > 99
          }
        ],
        tableData: allTrades.slice(0, 10).map((trade: any) => ({
          type: trade.type,
          security: trade.security,
          amount: `${trade.amount < 0 ? '-' : ''}$${Math.abs(trade.amount / 1000).toFixed(0)}K`,
          shares: trade.shares,
          price: `$${trade.price.toFixed(2)}`,
          date: new Date(trade.date).toLocaleDateString(),
          isPositive: trade.type === 'Buy'
        })),
        highlights: [
          `${data.totalTransactions} transactions totaling $${(data.totalVolume / 1000).toFixed(0)}K in volume`,
          `Net cash flow of $${(data.netCashFlow / 1000).toFixed(0)}K maintaining target allocation`,
          `Execution quality at ${data.avgExecutionQuality}% of target prices`
        ]
      };
    }

    // Default: Annual trading activity
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
      tableData: data.majorTrades?.map((trade: any) => ({
        type: trade.type,
        security: trade.security,
        amount: `${trade.amount < 0 ? '-' : ''}$${Math.abs(trade.amount / 1000)}K`,
        impact: `${trade.impact > 0 ? '+' : ''}${trade.impact}%`,
        date: new Date(trade.date).toLocaleDateString(),
        isPositive: trade.type === 'Buy'
      })) || []
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