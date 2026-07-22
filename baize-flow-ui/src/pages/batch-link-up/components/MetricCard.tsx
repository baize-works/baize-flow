import React from "react";
import CountUp from "react-countup";
import "../index.less"

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit }) => {
  return (
    <div className="metric-card">
      <div className="title">{title}</div>
      <div className="big-number">
        <CountUp end={value} separator="," />
      </div>
      <div>
        <div className="small-number">Unit：{unit}</div>
      </div>
    </div>
  );
};

export default MetricCard;