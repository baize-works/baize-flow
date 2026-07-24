import React from "react";
import { statusMeta } from "../constants";
import type { StreamStatus } from "../types";

interface StatusBadgeProps {
  status: StreamStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const meta = statusMeta[status];

  return (
    <span
      className={[
        "inline-flex h-7 items-center gap-2 rounded-full px-3 text-xs font-bold tracking-wide",
        // meta.className,
      ].join(" ")}
    >
      <i className={["h-1.5 w-1.5 rounded-full", meta.dotClassName].join(" ")} />
      {meta.text}
    </span>
  );
};

export default StatusBadge;