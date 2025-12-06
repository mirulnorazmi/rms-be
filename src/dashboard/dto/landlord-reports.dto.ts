import { ApiProperty } from '@nestjs/swagger';

export class MonthlyOverviewDto {
  @ApiProperty({ example: 'December 2025', description: 'The period for the overview' })
  period: string;

  @ApiProperty({ example: 15000.00, description: 'Total revenue for the period' })
  revenue: number;

  @ApiProperty({ example: 3500.00, description: 'Total expenses for the period' })
  expenses: number;

  @ApiProperty({ example: 11500.00, description: 'Net income (revenue - expenses)' })
  net_income: number;

  @ApiProperty({ example: 'RM', description: 'Currency code' })
  currency: string;
}

class VacancyRateDto {
  @ApiProperty({ example: 20.0, description: 'Vacancy rate for current month (%)' })
  current_month: number;

  @ApiProperty({ example: 15.5, description: 'Year-to-date vacancy rate (%)' })
  year_to_date: number;

  @ApiProperty({ example: 'December 2025', description: 'Month label' })
  month_label: string;

  @ApiProperty({ example: '2025', description: 'Year label' })
  year_label: string;
}

class CollectionRateDto {
  @ApiProperty({ example: 92.5, description: 'Collection rate for current month (%)' })
  current_month: number;

  @ApiProperty({ example: 89.3, description: 'Year-to-date collection rate (%)' })
  year_to_date: number;

  @ApiProperty({ example: 'December 2025', description: 'Month label' })
  month_label: string;

  @ApiProperty({ example: '2025', description: 'Year label' })
  year_label: string;
}

export class KeyMetricsDto {
  @ApiProperty({ type: VacancyRateDto })
  vacancy_rate: VacancyRateDto;

  @ApiProperty({ type: CollectionRateDto })
  collection_rate: CollectionRateDto;
}

export class ProfitDataPointDto {
  @ApiProperty({ example: 'Jan', description: 'Month abbreviation' })
  month: string;

  @ApiProperty({ example: 2025, description: 'Year' })
  year: number;

  @ApiProperty({ example: 11500.00, description: 'Actual profit for the month' })
  actual_profit: number;

  @ApiProperty({ example: 12000.00, description: 'AI predicted profit for the month' })
  predicted_profit: number;
}

export class ProfitGraphInsightDto {
  @ApiProperty({ enum: ['increasing', 'decreasing', 'stable'], description: 'Overall profit trend' })
  trend: 'increasing' | 'decreasing' | 'stable';

  @ApiProperty({ example: 87.5, description: 'Prediction accuracy score (0-100)' })
  accuracy_score: number;

  @ApiProperty({ example: 'Profit has been steadily increasing over the past 6 months...', description: 'AI-generated insight about the graph' })
  insight: string;

  @ApiProperty({ example: 'Consider investing in property improvements to maintain growth...', description: 'AI recommendation' })
  recommendation: string;

  @ApiProperty({ type: [String], example: ['High occupancy rate', 'Consistent rent collection'], description: 'Key factors affecting profit' })
  key_factors: string[];
}

export class ProfitGraphDto {
  @ApiProperty({ type: [ProfitDataPointDto], description: 'Monthly profit data points for graph' })
  data_points: ProfitDataPointDto[];

  @ApiProperty({ type: ProfitGraphInsightDto, description: 'AI-powered insight about the profit graph' })
  insight: ProfitGraphInsightDto;

  @ApiProperty({ example: 'RM', description: 'Currency code' })
  currency: string;
}

export class LandlordReportsDto {
  @ApiProperty({ type: MonthlyOverviewDto })
  monthly_overview: MonthlyOverviewDto;

  @ApiProperty({ type: KeyMetricsDto })
  key_metrics: KeyMetricsDto;

  @ApiProperty({ type: ProfitGraphDto })
  profit_graph: ProfitGraphDto;

  @ApiProperty({ example: '2025-12-06T10:30:00.000Z', description: 'Timestamp when the report was generated' })
  generated_at: string;
}

