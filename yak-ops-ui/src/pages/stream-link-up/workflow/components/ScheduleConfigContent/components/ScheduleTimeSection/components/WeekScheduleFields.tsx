import { ClockCircleOutlined } from "@ant-design/icons";
import { Form, Input, Select } from "antd";
import React from "react";
import { formItemStyle, labelNodeStyle } from "../constants";
import { weekdayOptions } from "../constants";
import { normalizeTime } from "../utils";
import type { WeeklyModeValue } from "../types";

interface Props {
  weeklyValue: WeeklyModeValue;
  onChange: (value: WeeklyModeValue) => void;
}

const WeekScheduleFields: React.FC<Props> = ({ weeklyValue, onChange }) => {
  return (
    <>
      <Form.Item
        style={formItemStyle}
        label={<span style={labelNodeStyle}>指定时间</span>}
        required
      >
        <Select
          size="small"
          mode="multiple"
          className="w-[260px]"
          value={weeklyValue.weekdays}
          onChange={(value: string[]) =>
            onChange({
              ...weeklyValue,
              weekdays: value,
            })
          }
          maxTagCount="responsive"
          placeholder="请选择星期"
          options={weekdayOptions}
        />
      </Form.Item>

      <Form.Item
        style={formItemStyle}
        label={<span style={labelNodeStyle}>调度时间</span>}
        required
      >
        <Input
          size="small"
          className="w-[160px]"
          value={weeklyValue.time}
          onChange={(e) =>
            onChange({
              ...weeklyValue,
              time: e.target.value,
            })
          }
          onBlur={() =>
            onChange({
              ...weeklyValue,
              time: normalizeTime(weeklyValue.time),
            })
          }
          suffix={<ClockCircleOutlined className="text-[#98A2B3]" />}
          placeholder="00:17"
        />
      </Form.Item>
    </>
  );
};

export default WeekScheduleFields;