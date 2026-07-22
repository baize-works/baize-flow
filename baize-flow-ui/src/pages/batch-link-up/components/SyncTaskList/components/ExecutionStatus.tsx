import HandIcon from "@/pages/batch-link-up/icon/HandIcon";
import { ClockCircleOutlined } from "@ant-design/icons";

import { useIntl } from "@umijs/max";

interface ExecutionStatusProps {
  record: any;
}

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  const intl = useIntl();

  return (
    <>
      {/* Execution */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 19,
            marginRight: 8,
            color: "#1890ff",
          }}
        >
          ·
        </span>

        <span style={{ marginRight: 16, fontWeight: 700, color: "#333" }}>
          {intl.formatMessage({
            id: "pages.job.execution.runMode",
            defaultMessage: "Run Mode:",
          })}{" "}
        </span>

        {record?.runMode === "MANUAL" ? (
          <div
            style={{
              display: "inline-block",
              transition: "transform 0.3s",
              animation: "bounce 1.2s infinite",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <HandIcon width={20} height={20} fill="#fa8c16" />
          </div>
        ) : (
          <ClockCircleOutlined
            style={{
              fontSize: 20,
              color: "#52c41a",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        )}
      </div>

      {/* Time */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 42, fontWeight: 700 }}>
          {intl.formatMessage({
            id: "pages.job.execution.time",
            defaultMessage: "Time:",
          })}{" "}
        </span>
        <span style={{ color: "gray" }}>
          {record?.duration || "-"}{" "}
          {intl.formatMessage({
            id: "pages.job.execution.unit.seconds",
            defaultMessage: "s",
          })}
        </span>
      </div>

      {/* Amount */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 30, fontWeight: 700 }}>
          {intl.formatMessage({
            id: "pages.job.execution.amount",
            defaultMessage: "Amount:",
          })}{" "}
        </span>
        <span style={{ color: "gray" }}>
          {record?.readRowCount ?? 0}{" "}
          {intl.formatMessage({
            id: "pages.job.execution.unit.rows",
            defaultMessage: "r",
          })}
        </span>
      </div>

      {/* QPS */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 43, fontWeight: 700 }}>
          {intl.formatMessage({
            id: "pages.job.execution.qps",
            defaultMessage: "QPS:",
          })}{" "}
        </span>
        <span style={{ color: "gray" }}>
          {record?.qps ?? 0}{" "}
          {intl.formatMessage({
            id: "pages.job.execution.unit.rowsPerSecond",
            defaultMessage: "r/s",
          })}
        </span>
      </div>

      {/* Size */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 43, fontWeight: 700 }}>
          {intl.formatMessage({
            id: "pages.job.execution.size",
            defaultMessage: "Size:",
          })}{" "}
        </span>
        <span style={{ color: "gray" }}>{record?.syncSize || "-"}</span>
      </div>
    </>
  );
};

export default ExecutionStatus;