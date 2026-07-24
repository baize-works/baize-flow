import { ClockCircleOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import React from "react";
import { formItemStyle, labelNodeStyle } from "../constants";
import { normalizeTime } from "../utils";
import type { DailyModeValue } from "../types";

interface Props {
  dailyValue: DailyModeValue;
  onChange: (value: DailyModeValue) => void;
}

const DayScheduleFields: React.FC<Props> = ({ dailyValue, onChange }) => {
  return (
    <Form.Item
      style={formItemStyle}
      label={<span style={labelNodeStyle}>调度时间</span>}
      required
    >
      <Input
        size="small"
        className="w-[160px]"
        value={dailyValue.time}
        onChange={(e) =>
          onChange({
            time: e.target.value,
          })
        }
        onBlur={() =>
          onChange({
            time: normalizeTime(dailyValue.time),
          })
        }
        suffix={<ClockCircleOutlined className="text-[#98A2B3]" />}
        placeholder="00:17"
      />
    </Form.Item>
  );
};

export default DayScheduleFields;