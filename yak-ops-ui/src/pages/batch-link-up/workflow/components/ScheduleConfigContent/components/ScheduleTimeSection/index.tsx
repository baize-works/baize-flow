import { Alert, Form, Radio, Select, Space } from "antd";
import React, { useEffect, useMemo } from "react";
import { formItemStyle, labelNodeStyle } from "./constants";
import HourScheduleFields from "./components/HourScheduleFields";
import DayScheduleFields from "./components/DayScheduleFields";
import WeekScheduleFields from "./components/WeekScheduleFields";
import CronPreview from "./components/CronPreview";
import type { ScheduleTimeSectionProps } from "./types";
import {
  buildCron,
  defaultDailyValue,
  defaultHourlyAppointValue,
  defaultHourlyRangeValue,
  defaultWeeklyValue,
} from "./utils";

const ScheduleTimeSection: React.FC<ScheduleTimeSectionProps> = ({
  value,
  onChange,
}) => {
  const scheduleType = value?.scheduleType ?? "day";
  const hourMode = value?.hourMode ?? "range";
  const hourlyRangeValue = value?.hourlyRangeValue ?? defaultHourlyRangeValue;
  const hourlyAppointValue =
    value?.hourlyAppointValue ?? defaultHourlyAppointValue;
  const dailyValue = value?.dailyValue ?? defaultDailyValue;
  const weeklyValue = value?.weeklyValue ?? defaultWeeklyValue;
  const effectType = value?.effectType ?? "forever";

  const cronExpression = useMemo(() => {
    return buildCron(
      scheduleType,
      hourMode,
      hourlyRangeValue,
      hourlyAppointValue,
      dailyValue,
      weeklyValue
    );
  }, [
    scheduleType,
    hourMode,
    hourlyRangeValue,
    hourlyAppointValue,
    dailyValue,
    weeklyValue,
  ]);

  useEffect(() => {
    if (value?.cronExpression !== cronExpression) {
      onChange?.({
        cronExpression,
      });
    }
  }, [cronExpression, onChange, value?.cronExpression]);

  return (
    <div className="schedule-section-body" style={{ marginBottom: 40 }}>
      <div className="schedule-inner-panel">
        <Alert
          className="mb-4 rounded-lg"
          type="info"
          showIcon
          message={<span className="text-[13px]">调度时区为 Asia/Shanghai</span>}
        />

        <Form
          layout="horizontal"
          component={false}
          labelCol={{ flex: "118px" }}
          wrapperCol={{ flex: "1" }}
          labelAlign="left"
        >
          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>调度周期</span>}
            required
          >
            <Select
              size="small"
              className="w-[180px]"
              value={scheduleType}
              onChange={(nextValue) =>
                onChange?.({
                  scheduleType: nextValue,
                })
              }
              options={[
                { label: "小时", value: "hour" },
                { label: "日", value: "day" },
                { label: "周", value: "week" },
              ]}
            />
          </Form.Item>

          {scheduleType === "hour" && (
            <HourScheduleFields
              hourMode={hourMode}
              hourlyRangeValue={hourlyRangeValue}
              hourlyAppointValue={hourlyAppointValue}
              onChange={onChange ?? (() => {})}
            />
          )}

          {scheduleType === "day" && (
            <DayScheduleFields
              dailyValue={dailyValue}
              onChange={(nextValue) =>
                onChange?.({
                  dailyValue: nextValue,
                })
              }
            />
          )}

          {scheduleType === "week" && (
            <WeekScheduleFields
              weeklyValue={weeklyValue}
              onChange={(nextValue) =>
                onChange?.({
                  weeklyValue: nextValue,
                })
              }
            />
          )}

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>生效日期</span>}
            required
          >
            <Radio.Group
              value={effectType}
              onChange={(e) =>
                onChange?.({
                  effectType: e.target.value,
                })
              }
            >
              <Space size={16} wrap>
                <Radio value="forever">永久生效</Radio>
                <Radio value="assign">指定时间</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <CronPreview cronExpression={cronExpression} />
        </Form>
      </div>
    </div>
  );
};

export default ScheduleTimeSection;