export type ChartSortBy = "data" | "x" | "y";
export type ChartSortOrder = "asc" | "desc";

export interface ChartRow {
  [key: string]: string | number | null | undefined;
}

export interface BaseChartProps {
  data: ChartRow[];

  themeColors?: string[];

  height?: number | string;
  loading?: boolean;
  emptyText?: string;
  title?: string;
}

export interface AxisChartProps extends BaseChartProps {
  xField?: string;
  yField?: string;

  showLegend?: boolean;
  showLabel?: boolean;
  showAxis?: boolean;
  showGrid?: boolean;

  sortBy?: ChartSortBy;
  sortOrder?: ChartSortOrder;

  seriesName?: string;
}

export interface CategoryValueChartProps extends BaseChartProps {
  categoryField?: string;
  valueField?: string;

  showLegend?: boolean;
  showLabel?: boolean;

  sortBy?: ChartSortBy;
  sortOrder?: ChartSortOrder;

  seriesName?: string;
}

export interface NumberChartProps extends BaseChartProps {
  metricField?: string;
  label?: string;
  suffix?: string;
  prefix?: string;
}