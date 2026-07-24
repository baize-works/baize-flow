import HttpUtils from "@/utils/HttpUtils";
import {
  ConnectorParamQuery,
  ConnectorParamVO,
  PageResult,
  SaveTimeVariablePayload,
  TimeVariablePreviewPayload,
  TimeVariablePreviewVO,
  TimeVariableQuery,
  TimeVariableVO,
} from "./types";

export interface SaveConnectorParamPayload {
  id?: number;
  type: string;
  connectorName: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  requiredFlag: number;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;
  remark?: string;
}

export interface ConnectorParamListQuery {
  connectorName?: string;
  type?: string;
}

export async function fetchConnectorParamPage(params: ConnectorParamQuery) {
  return HttpUtils.post<PageResult<ConnectorParamVO>>(
    "/api/v1/connector-param-meta/page",
    params
  );
}

export async function fetchConnectorParamDetail(id: number) {
  return HttpUtils.get<ConnectorParamVO>(`/api/v1/connector-param-meta/${id}`);
}

export async function createConnectorParam(data: SaveConnectorParamPayload) {
  return HttpUtils.post<number>("/api/v1/connector-param-meta", data);
}

export async function updateConnectorParam(data: SaveConnectorParamPayload) {
  if (!data.id) {
    throw new Error("更新 Connector 参数时 id 不能为空");
  }

  return HttpUtils.put<boolean>(
    `/api/v1/connector-param-meta/${data.id}`,
    data
  );
}

export async function deleteConnectorParam(id: number) {
  return HttpUtils.delete<boolean>(`/api/v1/connector-param-meta/${id}`);
}

export async function fetchConnectorParamList(
) {
  return HttpUtils.get<ConnectorParamVO[]>(
    "/api/v1/connector-param-meta/list"
  );
}

export interface ConnectorParamOptionQuery {
  type?: string;
  connectorName?: string;
  connectorType?: string;
  dbType?: string;
}

export interface ConnectorParamOptionVO {
  value: string;
  label?: string;
  description?: string;
  defaultValue?: string;
  exampleValue?: string;
  paramType?: string;
  requiredFlag?: number;
}

function buildQuery(params?: Record<string, any>) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchConnectorParamOptions(
  params?: ConnectorParamOptionQuery
) {
  return HttpUtils.get<ConnectorParamOptionVO[]>(
    `/api/v1/connector-param-meta/option${buildQuery(params)}`
  );
}


/**
 * 时间变量分页查询
 */
export async function fetchTimeVariablePage(params: TimeVariableQuery) {
  return HttpUtils.post<any>("/api/v1/time-variable/page", params);
}

/**
 * 新增时间变量
 */
export async function createTimeVariable(data: SaveTimeVariablePayload) {
  return HttpUtils.post<number>("/api/v1/time-variable", data);
}

/**
 * 修改时间变量
 */
export async function updateTimeVariable(data: SaveTimeVariablePayload) {
  if (!data.id) {
    throw new Error("更新时间变量时 id 不能为空");
  }

  return HttpUtils.put<number>(`/api/v1/time-variable/${data.id}`, data);
}

/**
 * 删除时间变量
 */
export async function deleteTimeVariable(id: number) {
  return HttpUtils.delete<boolean>(`/api/v1/time-variable/${id}`);
}

/**
 * 预览时间表达式
 */
export async function previewTimeVariable(data: TimeVariablePreviewPayload) {
  return HttpUtils.post<TimeVariablePreviewVO>(
    "/api/v1/time-variable/preview",
    data
  );
}

export async function fetchTimeVariableList() {
  return HttpUtils.get<any[]>("/api/v1/time-variable/list");  
}