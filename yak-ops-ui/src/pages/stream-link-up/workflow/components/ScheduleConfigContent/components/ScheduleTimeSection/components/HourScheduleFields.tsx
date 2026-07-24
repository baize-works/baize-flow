import { ClockCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";
import React from "react";
import { formItemStyle, labelNodeStyle } from "../constants";
import {
  hourOptions,
  intervalOptions,
  modeBtnActive,
  modeBtnBase,
  modeBtnInactive,
} from "../constants";
import { normalizeMinute, normalizeTime } from "../utils";
import type {
  HourMode,
  HourlyAppointModeValue,
  HourlyRangeModeValue,
} from "../types";

interface Props {
  hourMode: HourMode;
  hourlyRangeValue: HourlyRangeModeValue;
  hourlyAppointValue: HourlyAppointModeValue;
  onChange: (patch: {
    hourMode?: HourMode;
    hourlyRangeValue?: HourlyRangeModeValue;
    hourlyAppointValue?: HourlyAppointModeValue;
  }) => void;
}

const HourScheduleFields: React.FC<Props> = ({
  hourMode,
  hourlyRangeValue,
  hourlyAppointValue,
  onChange,
}) => {
  return (
    <>
      <Form.Item
        style={formItemStyle}
        required
        label={<span style={labelNodeStyle}>时间方式</span>}
      >
        <div className="inline-flex rounded-lg border border-[#D0D5DD] bg-[#F5F7FA] p-[2px]">
          <Button
            type="text"
            size="small"
            className={`${modeBtnBase} ${
              hourMode === "range" ? modeBtnActive : modeBtnInactive
            }`}
            onClick={() => onChange({ hourMode: "range" })}
          >
            小时区间
          </Button>

          <Button
            type="text"
            size="small"
            className={`${modeBtnBase} ${
              hourMode === "appoint" ? modeBtnActive : modeBtnInactive
            }`}
            onClick={() => onChange({ hourMode: "appoint" })}
          >
            指定小时
          </Button>
        </div>
      </Form.Item>

      {hourMode === "range" && (
        <>
          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>开始时间</span>}
            required
          >
            <Input
              size="small"
              className="w-[160px]"
              value={hourlyRangeValue.startTime}
              onChange={(e) =>
                onChange({
                  hourlyRangeValue: {
                    ...hourlyRangeValue,
                    startTime: e.target.value,
                  },
                })
              }
              onBlur={() =>
                onChange({
                  hourlyRangeValue: {
                    ...hourlyRangeValue,
                    startTime: normalizeTime(hourlyRangeValue.startTime),
                  },
                })
              }
              suffix={<ClockCircleOutlined className="text-[#98A2B3]" />}
              placeholder="00:00"
            />
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>时间间隔</span>}
            required
          >
            <Space size={8}>
              <Select
                size="small"
                className="w-[260px]"
                value={hourlyRangeValue.intervalHour}
                onChange={(value: number) =>
                  onChange({
                    hourlyRangeValue: {
                      ...hourlyRangeValue,
                      intervalHour: value,
                    },
                  })
                }
                options={intervalOptions}
              />
              <span className="text-[13px] text-[#667085]">小时</span>
            </Space>
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>结束时间</span>}
            required
          >
            <Input
              size="small"
              className="w-[160px]"
              value={hourlyRangeValue.endTime}
              onChange={(e) =>
                onChange({
                  hourlyRangeValue: {
                    ...hourlyRangeValue,
                    endTime: e.target.value,
                  },
                })
              }
              onBlur={() =>
                onChange({
                  hourlyRangeValue: {
                    ...hourlyRangeValue,
                    endTime: normalizeTime(hourlyRangeValue.endTime),
                  },
                })
              }
              suffix={<ClockCircleOutlined className="text-[#98A2B3]" />}
              placeholder="23:59"
            />
          </Form.Item>
        </>
      )}

      {hourMode === "appoint" && (
        <>
          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>指定小时</span>}
            required
          >
            <Select
              size="small"
              mode="multiple"
              className="w-[240px]"
              value={hourlyAppointValue.hours}
              onChange={(value: number[]) =>
                onChange({
                  hourlyAppointValue: {
                    ...hourlyAppointValue,
                    hours: value,
                  },
                })
              }
              maxTagCount="responsive"
              placeholder="请选择小时"
              options={hourOptions}
            />
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>指定分钟</span>}
            required
          >
            <Input
              size="small"
              className="w-[160px]"
              value={hourlyAppointValue.minute}
              onChange={(e) =>
                onChange({
                  hourlyAppointValue: {
                    ...hourlyAppointValue,
                    minute: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
                  },
                })
              }
              onBlur={() =>
                onChange({
                  hourlyAppointValue: {
                    ...hourlyAppointValue,
                    minute: normalizeMinute(hourlyAppointValue.minute),
                  },
                })
              }
              suffix={<ClockCircleOutlined className="text-[#98A2B3]" />}
              placeholder="00"
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default HourScheduleFields;