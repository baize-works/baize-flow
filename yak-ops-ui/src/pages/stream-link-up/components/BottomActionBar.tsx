import React from "react";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Pagination, Tag } from "antd";

interface BottomActionBarProps {
  total: number;
  selectedCount: number;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;

  current?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  total,
  selectedCount,
  disabled,
  onStart,
  onStop,
  current = 1,
  pageSize = 10,
  onPageChange,
}) => {
  return (
    <div className="fixed bottom-0 right-0 z-[99] flex min-h-16 items-center justify-between border-t border-slate-200 bg-white/90 px-10 py-3 backdrop-blur-xl left-[var(--pro-sider-current-width,0px)]">
      <div className="flex items-center gap-3">
        {/* <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          disabled={disabled}
          onClick={onStart}
          className="h-8 min-w-[88px] rounded-full border-none font-bold shadow-[0_12px_26px_rgba(53,84,209,0.23)]"
        >
          <span style={{ fontSize: 14 }}>启动</span>
        </Button>

        <Button
          icon={<StopOutlined />}
          disabled={disabled}
          onClick={onStop}
          className="h-8 min-w-[88px] rounded-full border-slate-200 font-semibold text-slate-500"
        >
          <span style={{ fontSize: 14 }}>停止</span>
        </Button>

        {selectedCount > 0 && (
          <Tag color="blue" className="rounded-full px-3 py-0.5">
            已选择 {selectedCount} 个任务
          </Tag>
        )} */}
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <span>共 {total} 条</span>

        <Pagination
          size="small"
          total={total}
          current={current}
          pageSize={pageSize}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default BottomActionBar;