import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  StopFilled,
} from "@ant-design/icons";
import React from "react";
import type { IntlShape } from "react-intl";

export const getHistoryStatusMeta = (status: string, intl: IntlShape) => {
  switch (status) {
    case "FINISHED":
    case "SUCCESS":
      return {
        text: intl.formatMessage({
          id: "pages.job.status.success",
          defaultMessage: "成功",
        }),
        color: "#16a34a",
        dotColor: "#22c55e",
        lightBg: "rgba(34, 197, 94, 0.12)",
        icon: <CheckCircleFilled style={{ color: "#22c55e" }} />,
      };

    case "RUNNING":
      return {
        text: intl.formatMessage({
          id: "pages.job.status.running",
          defaultMessage: "运行中",
        }),
        color: "#2563eb",
        dotColor: "#3b82f6",
        lightBg: "rgba(59, 130, 246, 0.12)",
        icon: <LoadingOutlined style={{ color: "#3b82f6" }} />,
      };

    case "FAILED":
      return {
        text: intl.formatMessage({
          id: "pages.job.status.failed",
          defaultMessage: "失败",
        }),
        color: "#e11d48",
        dotColor: "#f43f5e",
        lightBg: "rgba(244, 63, 94, 0.12)",
        icon: <CloseCircleFilled style={{ color: "#f43f5e" }} />,
      };

    case "CANCELED":
    case "CANCELLED":
      return {
        text: intl.formatMessage({
          id: "pages.job.status.canceled",
          defaultMessage: "已取消",
        }),
        color: "#64748b",
        dotColor: "#94a3b8",
        lightBg: "rgba(148, 163, 184, 0.16)",
        icon: <StopFilled style={{ color: "#94a3b8" }} />,
      };

    default:
      return {
        text: status || "-",
        color: "#64748b",
        dotColor: "#94a3b8",
        lightBg: "rgba(148, 163, 184, 0.16)",
        icon: <StopFilled style={{ color: "#94a3b8" }} />,
      };
  }
};