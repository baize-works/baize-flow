import React from "react";
import type { RealtimeTask } from "../types";

interface MiniSparklineProps {
  type?: RealtimeTask["trendType"];
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ type = "blue" }) => {
  const strokeClassNameMap = {
    blue: "stroke-indigo-500 fill-indigo-500",
    green: "stroke-emerald-500 fill-emerald-500",
    orange: "stroke-amber-500 fill-amber-500",
    gray: "stroke-slate-400 fill-slate-400",
  };

  return (
    <svg width="78" height="24" viewBox="0 0 78 24" fill="none">
      <path
        d="M2 15C8 15 9 11 14 12.5C19 14 20 18 25 16C30 14 30 9 36 10.5C42 12 42 18 48 15.5C54 13 55 6 61 8.5C67 11 67 15 76 10"
        className={strokeClassNameMap[type]}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 15C8 15 9 11 14 12.5C19 14 20 18 25 16C30 14 30 9 36 10.5C42 12 42 18 48 15.5C54 13 55 6 61 8.5C67 11 67 15 76 10V24H2V15Z"
        className={strokeClassNameMap[type]}
        opacity="0.08"
      />
    </svg>
  );
};

export default MiniSparkline;