import React from "react";
import { getTypeIcon } from "../utils";

interface ConnectorPillProps {
  type: string;
  label: string;
}

const ConnectorPill: React.FC<ConnectorPillProps> = ({ type, label }) => {
  return (
    <span className="inline-flex min-w-[92px] items-center gap-2 font-semibold text-slate-700">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm">
        {getTypeIcon(type)}
      </span>
      <span>{label}</span>
    </span>
  );
};

export default ConnectorPill;