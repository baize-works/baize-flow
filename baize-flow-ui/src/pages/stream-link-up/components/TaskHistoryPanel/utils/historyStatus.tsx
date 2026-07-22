import { HistoryItem } from "@/pages/batch-link-up/type";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { IntlShape } from "react-intl";


export const getHistoryStatusMeta = (
  status: HistoryItem["jobStatus"],
  intl: IntlShape
) => {
  switch (status) {
    case "FAILED":
      return {
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        text: intl.formatMessage({
          id: "pages.job.history.status.failed",
          defaultMessage: "Failed",
        }),
        tagColor: "error",
        dotColor: "#ff4d4f",
        lightBg: "#fff2f0",
      };

    case "FINISHED":
      return {
        icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
        text: intl.formatMessage({
          id: "pages.job.history.status.finished",
          defaultMessage: "Success",
        }),
        tagColor: "success",
        dotColor: "#52c41a",
        lightBg: "#f6ffed",
      };

    case "RUNNING":
      return {
        icon: <SyncOutlined spin style={{ color: "#1677ff" }} />,
        text: intl.formatMessage({
          id: "pages.job.history.status.running",
          defaultMessage: "Running",
        }),
        tagColor: "processing",
        dotColor: "#1677ff",
        lightBg: "#e6f4ff",
      };

    default:
      return {
        icon: <ClockCircleOutlined style={{ color: "#8c8c8c" }} />,
        text: status || "Unknown",
        tagColor: "default",
        dotColor: "#8c8c8c",
        lightBg: "#fafafa",
      };
  }
};