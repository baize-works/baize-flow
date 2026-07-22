import { Empty, List } from "antd";
import React from "react";
import type { IntlShape } from "react-intl";

import type { HistoryItem } from "@/pages/batch-link-up/type";
import HistoryListItem from "./HistoryListItem";

interface HistoryListProps {
  intl: IntlShape;
  loading: boolean;
  historyItems: HistoryItem[];
  instanceItem: any;
  onSelect: (item: HistoryItem) => void;
}

const PixelEmptyMan: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
      <svg
        width="96"
        height="72"
        viewBox="0 0 96 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="mb-3"
        aria-hidden="true"
      >
        {/* shadow */}
        <rect x="28" y="62" width="40" height="4" fill="#CBD5E1" />
        <rect x="36" y="66" width="24" height="2" fill="#E2E8F0" />

        {/* body */}
        <rect x="34" y="30" width="28" height="24" fill="#E2E8F0" />
        <rect x="38" y="34" width="20" height="16" fill="#F8FAFC" />

        {/* head */}
        <rect x="32" y="12" width="32" height="24" fill="#CBD5E1" />
        <rect x="36" y="16" width="24" height="16" fill="#F8FAFC" />

        {/* ears */}
        <rect x="28" y="20" width="4" height="8" fill="#CBD5E1" />
        <rect x="64" y="20" width="4" height="8" fill="#CBD5E1" />

        {/* eyes */}
        <rect x="40" y="22" width="4" height="4" fill="#94A3B8" />
        <rect x="52" y="22" width="4" height="4" fill="#94A3B8" />

        {/* empty mouth */}
        <rect x="44" y="30" width="8" height="2" fill="#94A3B8" />

        {/* arms */}
        <rect x="26" y="34" width="8" height="4" fill="#CBD5E1" />
        <rect x="62" y="34" width="8" height="4" fill="#CBD5E1" />

        {/* legs */}
        <rect x="38" y="54" width="6" height="8" fill="#CBD5E1" />
        <rect x="52" y="54" width="6" height="8" fill="#CBD5E1" />

        {/* tiny empty box */}
        <rect x="70" y="42" width="12" height="10" fill="#E2E8F0" />
        <rect x="72" y="44" width="8" height="2" fill="#F8FAFC" />
      </svg>

      <div className="text-xs font-medium text-slate-400">No run history</div>
      <div className="mt-1 text-[11px] text-slate-300">
        Waiting for the first run
      </div>
    </div>
  );
};

const HistoryList: React.FC<HistoryListProps> = ({
  intl,
  loading,
  historyItems,
  instanceItem,
  onSelect,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-2">
      <List
        loading={loading}
        dataSource={historyItems}
        locale={{
          emptyText: <PixelEmptyMan />,
        }}
        renderItem={(item) => (
          <HistoryListItem
            item={item}
            intl={intl}
            active={instanceItem?.id === item.id}
            onSelect={onSelect}
          />
        )}
      />
    </div>
  );
};

export default HistoryList;