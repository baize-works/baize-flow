import type { CSSProperties } from "react";
import type { ParamRow } from "./types";

export const paramData: ParamRow[] = [
  {
    key: "1",
    paramName: "bizdate",
    paramValue: "${add_months(yyyymmdd,-1)}",
  },
];

export const labelNodeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: "#475467",
  lineHeight: "20px",
};

export const formItemStyle: CSSProperties = {
  marginBottom: 14,
};

export const timeoutUnitOptions = [
  { label: "分钟", value: "minute" },
  { label: "小时", value: "hour" },
];