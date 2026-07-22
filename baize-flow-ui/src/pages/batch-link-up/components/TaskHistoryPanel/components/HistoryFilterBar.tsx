import { SearchOutlined } from "@ant-design/icons";
import { DatePicker, Input, Segmented, Space } from "antd";
import dayjs from "dayjs";
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";
import type { IntlShape } from "react-intl";
import type { TimeRangeType } from "../hooks/useTaskHistory";

interface HistoryFilterBarProps {
  intl: IntlShape;
  keyword: string;
  onKeywordChange: (value: string) => void;
  timeRangeType: TimeRangeType;
  onTimeRangeTypeChange: (value: TimeRangeType) => void;
  customTimeRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  onCustomTimeRangeChange: (
    value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void;
}

const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  intl,
  keyword,
  onKeywordChange,
  timeRangeType,
  onTimeRangeTypeChange,
  customTimeRange,
  onCustomTimeRangeChange,
}) => {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Input
        allowClear
        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
        placeholder={intl.formatMessage({
          id: "pages.job.history.search.placeholder",
          defaultMessage: "Search by job name",
        })}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />

      <Segmented
        value={timeRangeType}
        onChange={(value) => onTimeRangeTypeChange(value as TimeRangeType)}
        block
        className="time-range-segmented"
        options={[
          {
            label: (
              <div className="time-range-option">
                <Clock3 size={14} />
                <span className="time-range-option__title">最近一天</span>
              </div>
            ),
            value: "最近一天",
          },
          {
            label: (
              <div className="time-range-option">
                <CalendarClock size={14} />
                <span className="time-range-option__title">最近三天</span>
              </div>
            ),
            value: "最近三天",
          },
          {
            label: (
              <div className="time-range-option">
                <CalendarDays size={14} />
                <span className="time-range-option__title">最近一周</span>
              </div>
            ),
            value: "最近一周",
          },
          {
            label: (
              <div className="time-range-option">
                <SlidersHorizontal size={14} />
                <span className="time-range-option__title">自定义</span>
              </div>
            ),
            value: "自定义",
          },
        ]}
      />

      {timeRangeType === "自定义" && (
        <DatePicker.RangePicker
          showTime
          style={{ width: "100%" }}
          value={customTimeRange as any}
          onChange={(values) => {
            onCustomTimeRangeChange(
              values ? [values[0] ?? null, values[1] ?? null] : null
            );
          }}
          placeholder={["开始时间", "结束时间"]}
          format="YYYY-MM-DD HH:mm:ss"
        />
      )}
    </Space>
  );
};

export default HistoryFilterBar;