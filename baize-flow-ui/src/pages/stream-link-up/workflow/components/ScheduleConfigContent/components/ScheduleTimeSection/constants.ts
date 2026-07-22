import type { SelectProps } from "antd";
import { CSSProperties } from "react";

export const weekdayOptions: SelectProps["options"] = [
    { label: "星期一", value: "MON" },
    { label: "星期二", value: "TUE" },
    { label: "星期三", value: "WED" },
    { label: "星期四", value: "THU" },
    { label: "星期五", value: "FRI" },
    { label: "星期六", value: "SAT" },
    { label: "星期日", value: "SUN" },
];

export const hourOptions: SelectProps["options"] = Array.from(
    { length: 24 },
    (_, index) => ({
        label: `${index}时`,
        value: index,
    })
);

export const intervalOptions: SelectProps["options"] = Array.from(
    { length: 24 },
    (_, index) => ({
        label: `${index + 1}`,
        value: index + 1,
    })
);

export const modeBtnBase =
    "!h-7 !rounded-md !px-3 !text-[12px] !border-0 !shadow-none transition-all duration-200";
export const modeBtnActive = "!bg-white !text-[#245BDB]";
export const modeBtnInactive =
    "!bg-transparent !text-[#667085] hover:!text-[#245BDB]";

export const formItemStyle: CSSProperties = {
    marginBottom: 14,
};

export const labelNodeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: "#475467",
  lineHeight: "20px",
};