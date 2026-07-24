import React, { useMemo } from "react";
import type { IntlShape } from "react-intl";

interface HistoryStatusFiltersProps {
  intl: IntlShape;
  statusFilter: string;
  statusCountMap: Record<string, number>;
  onStatusFilterChange: (status: string) => void;
}

const HistoryStatusFilters: React.FC<HistoryStatusFiltersProps> = ({
  intl,
  statusFilter,
  statusCountMap,
  onStatusFilterChange,
}) => {
  const quickFilters = useMemo(
    () => [
      {
        key: "FINISHED",
        label: intl.formatMessage({
          id: "pages.job.history.status.finished",
          defaultMessage: "Success",
        }),
        dotClassName: "bg-emerald-500",
        activeClassName: "border-emerald-400 bg-emerald-50 text-emerald-600",
        hoverClassName: "hover:border-emerald-200 hover:bg-emerald-50/70",
        count: statusCountMap.FINISHED || 0,
      },
      {
        key: "RUNNING",
        label: intl.formatMessage({
          id: "pages.job.history.status.running",
          defaultMessage: "Running",
        }),
        dotClassName: "bg-blue-500",
        activeClassName: "border-blue-400 bg-blue-50 text-blue-600",
        hoverClassName: "hover:border-blue-200 hover:bg-blue-50/70",
        count: statusCountMap.RUNNING || 0,
      },
      {
        key: "FAILED",
        label: intl.formatMessage({
          id: "pages.job.history.status.failed",
          defaultMessage: "Failed",
        }),
        dotClassName: "bg-rose-500",
        activeClassName: "border-rose-400 bg-rose-50 text-rose-600",
        hoverClassName: "hover:border-rose-200 hover:bg-rose-50/70",
        count: statusCountMap.FAILED || 0,
      },
    ],
    [intl, statusCountMap]
  );

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {quickFilters.map((item) => {
        const active = statusFilter === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onStatusFilterChange(active ? "all" : item.key)}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
              "select-none text-xs transition-all duration-200 ease-out",
              "border-slate-200 bg-slate-50 text-slate-600",
              "hover:shadow-sm active:scale-[0.98]",
              item.hoverClassName,
              active ? item.activeClassName : "",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-2 w-2 rounded-full",
                item.dotClassName,
              ].join(" ")}
            />

            <span className={active ? "font-semibold" : "font-normal"}>
              {item.label}({item.count})
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default HistoryStatusFilters;