export interface IMonthlyOverview {
  period: string; // e.g., "December 2025"
  revenue: number;
  expenses: number;
  net_income: number;
  currency: string;
}

export interface IKeyMetrics {
  vacancy_rate: {
    current_month: number; // percentage
    year_to_date: number; // percentage
    month_label: string;
    year_label: string;
  };
  collection_rate: {
    current_month: number; // percentage
    year_to_date: number; // percentage
    month_label: string;
    year_label: string;
  };
}

export interface IProfitDataPoint {
  month: string; // e.g., "Jan", "Feb"
  year: number;
  actual_profit: number;
  predicted_profit: number;
}

export interface IProfitGraphInsight {
  trend: 'increasing' | 'decreasing' | 'stable';
  accuracy_score: number; // 0-100, how accurate predictions were
  insight: string;
  recommendation: string;
  key_factors: string[];
}

export interface IProfitGraph {
  data_points: IProfitDataPoint[];
  insight: IProfitGraphInsight;
  currency: string;
}

export interface ILandlordReports {
  monthly_overview: IMonthlyOverview;
  key_metrics: IKeyMetrics;
  profit_graph: IProfitGraph;
  generated_at: string;
}

