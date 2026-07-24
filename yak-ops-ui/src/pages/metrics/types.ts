export interface ChartDataItem {
  date: string;
  value: any;
}

export interface ChartDataSet {
  data: any[];
  xAxis: string[];
}

export interface ChartData {
  recordsTrend: ChartDataSet;
  bytesTrend: ChartDataSet;
  recordsSpeedTrend: ChartDataSet;
  bytesSpeedTrend: ChartDataSet;
}

export interface SummaryData {
  totalRecords: number;
  totalBytes: number;
  totalTasks: number;
  successTasks: number;
  totalBytesUnit: any;
  totalRecordsUnit: any;
}

export type TimeRange = 'H24' | 'D30' | 'D7' | 'H1' | 'H6' | 'H12';
export type TaskType = 'STREAMING' | 'BATCH';