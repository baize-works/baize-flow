export type MenuKey = "connector" | "time";

export type TimeVariableSource = "SYSTEM" | "CUSTOM";

export type TimeVariableValueType = "FIXED" | "DYNAMIC";

export interface PaginationInfo {
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface PaginationData<T> {
  bizData: T[];
  pagination: PaginationInfo;
}

export interface PageResult<T> {
  code: number;
  message: string;
  data: PaginationData<T>;
}

export interface ConnectorParamQuery {
  type?: string;
  connectorName?: string;
  paramName?: string;
  pageNo: number;
  pageSize: number;
}

export interface ConnectorParamVO {
  id: number;
  type: string;
  connectorName: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  requiredFlag: number;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;
  remark?: string;
}

export interface ConnectorParamItem {
  id: number;
  type: "connector";
  connectorName: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  required: boolean;
  defaultValue: string;
  exampleValue: string;
  paramContext?: string;
}

export interface TimeParamItem {
  key: any;
  id: number;
  type: "time";
  paramName: string;
  paramDesc: string;
  variableSource: TimeVariableSource;
  valueType: TimeVariableValueType;
  timeFormat: string;
  defaultValue?: string;
  exampleValue?: string;
  expression?: string;
  enabled?: boolean;
  remark?: string;
}
export type ParamItem = ConnectorParamItem | TimeParamItem;

export interface FormValues {
  connectorName?: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType?: string;
  required?: boolean;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;

  timeFormat?: string;
  expression?: string;
}


export interface TimeVariableVO {
  id: number;
  paramName: string;
  paramDesc: string;
  variableSource: TimeVariableSource;
  valueType: TimeVariableValueType;
  timeFormat: string;
  defaultValue?: string;
  expression?: string;
  exampleValue?: string;
  enabled?: boolean;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface SaveTimeVariablePayload {
  id?: number;
  paramName: string;
  paramDesc: string;
  variableSource?: TimeVariableSource;
  valueType: TimeVariableValueType;
  timeFormat: string;
  defaultValue?: string;
  expression?: string;
  exampleValue?: string;
  enabled?: boolean;
  remark?: string;
}

export interface TimeVariablePreviewPayload {
  expression: string;
  timeFormat: string;
  baseTime?: string;
}

export interface TimeVariablePreviewVO {
  expression: string;
  timeFormat: string;
  baseTime: string;
  value: string;
}

export interface TimeVariableQuery {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  variableSource?: TimeVariableSource;
  valueType?: TimeVariableValueType;
  enabled?: boolean;
}