export interface Metric {
  id: string;
  name: string;
  value: number;
  date: string;
}

export interface Report {
  id: string;
  title: string;
  data: Metric[];
}

export interface Filter {
  dateRande: { start: Date; end: Date };
  metricType: string;
}

export interface AnalyticsState {
  filters: Filter;
  cachedData: Report[];
}
