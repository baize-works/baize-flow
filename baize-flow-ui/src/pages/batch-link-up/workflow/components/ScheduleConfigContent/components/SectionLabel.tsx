import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface SectionLabelProps {
  title: string;
  tooltip?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ title, tooltip }) => {
  return (
    <div className="schedule-section-label">
      <span className="schedule-section-label__text">{title}</span>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined className="schedule-section-label__icon" />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default SectionLabel;