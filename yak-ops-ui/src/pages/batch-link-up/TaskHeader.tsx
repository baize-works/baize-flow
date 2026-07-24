import { Package } from "lucide-react";
import React from "react";

interface TaskDetailPanelProps {
  item: any;
}

const TaskHeader: React.FC<TaskDetailPanelProps> = ({ item }) => {
  return (
    <div className="flex h-[70px] items-center border-b border-slate-200 bg-white px-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border  "
          style={{
            color: "hsl(231 48% 48%)",
            borderColor: "hsl(231 48% 88%)",
            backgroundColor: "hsl(231 58% 98%)",
          }}
        >
          <Package size={17} strokeWidth={1.9} />
        </div>

        <p className="m-0 truncate text-sm font-semibold text-slate-900">
          {item?.jobName || "-"}
        </p>
      </div>
    </div>
  );
};

export default TaskHeader;
