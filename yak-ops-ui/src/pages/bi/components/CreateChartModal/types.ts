import type React from "react";

export type ChartType =
  | "bar"
  | "line"
  | "areaLine"
  | "zline"
  | "combo"
  | "pie"
  | "ringPie"
  | "rosePie"
  | "scatter"
  | "table"
  | "funnel"
  | "wordCloud"
  | "number";

export type SortBy = "data" | "x" | "y";

export type SortOrder = "asc" | "desc";

export interface FieldOption {
  label: string;
  value: string;
}

export interface ChartConfigValues {
  xField?: string;
  yField?: string;

  categoryField?: string;
  valueField?: string;

  tableFields?: string[];
  metricField?: string;

  showLegend: boolean;
  showLabel: boolean;
  showAxis: boolean;
  showGrid: boolean;

  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface CreateChartValues extends ChartConfigValues {
  name: string;
  chartType: ChartType;
  theme: string;
}

export interface ThemeOption {
  label: string;
  value: string;
  colors: string[];
}

export interface ChartConfigPanelProps {
  chartType: ChartType;
  value: ChartConfigValues;
  fieldOptions: FieldOption[];
  onChange: (patch: Partial<ChartConfigValues>) => void;
}

export interface ChartPreviewProps {
  chartType: ChartType;
  chartConfig: ChartConfigValues;
  themeColors: string[];
  previewData: Array<Record<string, string | number | null | undefined>>;
}

export interface ChartRegistryItem {
  label: string;
  value: ChartType;
  group: string;
  icon: React.ReactNode;
  defaultConfig?: Partial<ChartConfigValues>;
  ConfigPanel: React.FC<ChartConfigPanelProps>;
  Preview: React.FC<ChartPreviewProps>;
}