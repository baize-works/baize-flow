import { RefreshCw } from "lucide-react";
import React from "react";
import type { IntlShape } from "react-intl";

interface HistoryPanelHeaderProps {
  intl: IntlShape;
  onRefresh: () => void;
}

const HistoryPanelHeader: React.FC<HistoryPanelHeaderProps> = ({
  intl,
  onRefresh,
}) => {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div>
        <div className="text-[13px] font-medium leading-5 text-[#344054]">
          执行记录
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        title={intl.formatMessage({
          id: "pages.job.history.refresh",
          defaultMessage: "Refresh",
        })}
        className="
          inline-flex h-[30px] w-[30px] items-center justify-center
          rounded-lg border border-[#E4E7EC] bg-white text-[#667085]
          transition-all duration-200 ease-out
          hover:border-[#B2DDFF] hover:bg-[#F5FAFF] hover:text-[#1570EF]
          active:scale-[0.96]
        "
      >
        <RefreshCw size={15} strokeWidth={1.9} />
      </button>
    </div>
  );
};

export default HistoryPanelHeader;