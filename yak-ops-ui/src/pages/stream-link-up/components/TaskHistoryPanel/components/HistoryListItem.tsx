import { List, Tag, Typography } from "antd";
import React from "react";
import type { IntlShape } from "react-intl";

import type { HistoryItem } from "@/pages/batch-link-up/type";
import { getHistoryStatusMeta } from "../utils/historyStatus";

interface HistoryListItemProps {
  item: HistoryItem;
  active: boolean;
  intl: IntlShape;
  onSelect: (item: HistoryItem) => void;
}

const HistoryListItem: React.FC<HistoryListItemProps> = ({
  item,
  active,
  intl,
  onSelect,
}) => {
  const meta = getHistoryStatusMeta(item.jobStatus, intl);

  return (
    <List.Item
      onClick={() => onSelect(item)}
      className="!mb-2 !border-none !bg-transparent !p-0"
    >
      <div
        className={[
          "w-full cursor-pointer rounded-xl border px-3 py-2.5 transition-all duration-200 ease-out",
          "bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
          active
            ? "shadow-[0_3px_10px_rgba(67,78,181,0.08)]"
            : "border-slate-200 hover:shadow-[0_6px_18px_rgba(67,78,181,0.08)]",
        ].join(" ")}
        style={{
          borderColor: active ? "hsl(231 44% 82%)" : undefined,
          backgroundColor: active ? "hsl(231 56% 98.5%)" : undefined,
        }}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="mt-0.5 flex h-7 w-7 min-w-7 items-center justify-center rounded-lg"
            style={{ background: meta.lightBg }}
          >
            {meta.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Typography.Text
                strong
                ellipsis
                className="!max-w-[65%] !text-sm"
              >
                {item.jobName || "-"}
              </Typography.Text>

              <Tag
                color={meta.tagColor as any}
                className="!mr-0 !rounded-[10px] !px-2"
              >
                {meta.text}
              </Tag>
            </div>

            <div className="mt-1.5 text-xs leading-5 text-slate-400">
              <div>{item.startTime || "-"}</div>
              {item.endTime ? <div>{item.endTime}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </List.Item>
  );
};

export default HistoryListItem;
