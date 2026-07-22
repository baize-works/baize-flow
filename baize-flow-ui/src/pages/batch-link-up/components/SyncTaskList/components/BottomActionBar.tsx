import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Divider, Tooltip } from "antd";
import React from "react";
import CustomPagination from "../../../CustomPagination";

interface BottomActionBarProps {
  onStart: () => void;
  onStop: () => void;
  pagination: {
    total: number;
    current?: number;
    pageSize?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  selectedCount?: number;

  /**
   * 全局禁用，比如未选择任何任务时。
   */
  disabled?: boolean;

  /**
   * 单独控制启动按钮禁用。
   */
  startDisabled?: boolean;

  /**
   * 单独控制停止按钮禁用。
   */
  stopDisabled?: boolean;

  /**
   * 启动按钮提示。
   */
  startTooltip?: string;

  /**
   * 停止按钮提示。
   */
  stopTooltip?: string;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onStart,
  onStop,
  pagination,
  selectedCount = 0,
  disabled = false,
  startDisabled = false,
  stopDisabled = false,
  startTooltip,
  stopTooltip,
}) => {
  const intl = useIntl();

  const finalStartDisabled = disabled || startDisabled;
  const finalStopDisabled = disabled || stopDisabled;

  const defaultDisabledTooltip =
    selectedCount <= 0 ? "请先选择任务" : undefined;

  return (
    <div
      style={{
        position: "fixed",
        left: "var(--pro-sider-current-width)",
        right: 0,
        bottom: 0,
        padding: "12px 20px",
        background: "#fff",
        borderTop: "1px solid rgba(227,228,230,1)",
        zIndex: 99,
        transition: "left var(--pro-sider-transition-duration) ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip title={startTooltip || defaultDisabledTooltip}>
            <span style={{ display: "inline-flex" }}>
              <Button
                size="small"
                type="primary"
                onClick={onStart}
                disabled={finalStartDisabled}
                className="h-8 min-w-[88px] rounded-full border-none font-bold shadow-[0_12px_26px_rgba(53,84,209,0.23)]"
                icon={<PlayCircleOutlined />}
              >
                {intl.formatMessage({
                  id: "pages.common.action.run",
                  defaultMessage: "Run",
                })}
              </Button>
            </span>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title={stopTooltip || defaultDisabledTooltip}>
            <span style={{ display: "inline-flex" }}>
              <Button
                size="small"
                onClick={onStop}
                danger
                type="primary"
                disabled={finalStopDisabled}
                className="h-8 min-w-[88px] rounded-full border-none font-bold shadow-[0_12px_26px_rgba(244,63,94,0.18)]"
                icon={<StopOutlined />}
              >
                {intl.formatMessage({
                  id: "pages.common.action.stop",
                  defaultMessage: "Stop",
                })}
              </Button>
            </span>
          </Tooltip>

          {selectedCount > 0 ? (
            <>
              <Divider type="vertical" />

              <span className="text-xs text-slate-500">
                已选择{" "}
                <span className="font-semibold text-slate-900">
                  {selectedCount}
                </span>{" "}
                条
              </span>
            </>
          ) : null}
        </div>

        <div style={{ marginRight: 8 }}>
          <CustomPagination
            total={pagination.total}
            current={pagination.current}
            pageSize={pagination.pageSize}
            onChange={pagination.onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;