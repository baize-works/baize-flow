import { useIntl } from "@umijs/max";
import React from "react";

import type { HistoryItem } from "../../type";
import HistoryFilterBar from "./components/HistoryFilterBar";
import HistoryList from "./components/HistoryList";
import HistoryPanelHeader from "./components/HistoryPanelHeader";
import HistoryStatusFilters from "./components/HistoryStatusFilters";
import { useTaskHistory } from "./hooks/useTaskHistory";
import "./sync.less"

interface TaskHistoryPanelProps {
  selectedItem: any;
  statusFilter: string;
  onItemSelect: (id: number) => void;
  onStatusFilterChange: (status: string) => void;
  instanceItem: any;
  setInstanceItem: (item: any) => void;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({
  selectedItem,
  statusFilter,
  onItemSelect,
  onStatusFilterChange,
  instanceItem,
  setInstanceItem,
}) => {
  const intl = useIntl();

  const {
    historyItems,
    loading,

    keyword,
    setKeyword,

    timeRangeType,
    setTimeRangeType,

    customTimeRange,
    setCustomTimeRange,

    statusCountMap,
    fetchHistory,
  } = useTaskHistory({
    selectedItem,
    statusFilter,
  });

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInstanceItem(item);
    onItemSelect?.(item.id);
  };

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-white px-2.5 pb-2 pt-2.5">
        <HistoryPanelHeader intl={intl} onRefresh={fetchHistory} />

        <HistoryFilterBar
          intl={intl}
          keyword={keyword}
          onKeywordChange={setKeyword}
          timeRangeType={timeRangeType}
          onTimeRangeTypeChange={setTimeRangeType}
          customTimeRange={customTimeRange}
          onCustomTimeRangeChange={setCustomTimeRange}
        />

        <HistoryStatusFilters
          intl={intl}
          statusFilter={statusFilter}
          statusCountMap={statusCountMap}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>

      <HistoryList
        intl={intl}
        loading={loading}
        historyItems={historyItems}
        instanceItem={instanceItem}
        onSelect={handleSelectHistoryItem}
      />
    </div>
  );
};

export default TaskHistoryPanel;