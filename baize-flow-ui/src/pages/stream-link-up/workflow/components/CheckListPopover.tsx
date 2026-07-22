import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { WarningOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Popover } from "antd";
import { Check, CheckCheck } from "lucide-react";

interface CheckItem {
  message: string;
}

interface CheckGroup {
  nodeId: string;
  dbType?: string;
  title: string;
  nodeType: string;
  items: CheckItem[];
}

interface CheckStat {
  total: number;
}

interface CheckListPopoverProps {
  checkStat?: CheckStat;
  checkGroups?: any[];
  triggerClassName?: string;
}

export const CheckListPopover = ({
  checkStat = { total: 0 },
  checkGroups = [],
  triggerClassName = "",
}: CheckListPopoverProps) => {
  const intl = useIntl();

  const hasIssues = checkStat.total > 0;

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      overlayClassName="st-checklist-popover"
      content={
        <div className="w-[360px] p-1">
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-semibold text-[#101828]">
              {intl.formatMessage(
                {
                  id: "pages.checklist.title",
                  defaultMessage: "Checklist ({total})",
                },
                { total: checkStat.total }
              )}
            </div>
          </div>

          <div className="mb-2 mt-1 text-xs leading-4 text-[#676f83]">
            {intl.formatMessage({
              id: "pages.checklist.subtitle",
              defaultMessage:
                "Make sure all issues are resolved before publishing",
            })}
          </div>

          <div className="max-h-[300px] overflow-auto">
            {checkGroups.length > 0 ? (
              checkGroups.map((group) => (
                <div
                  key={group.nodeId}
                  className="mb-2 overflow-hidden rounded-xl border border-[rgb(16_24_40/0.08)] bg-white"
                >
                  <div className="p-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center">
                        <DatabaseIcons
                          dbType={group.dbType || "MYSQL"}
                          width="20"
                          height="20"
                        />
                        <span className="ml-1.5 truncate font-bold text-[#101828]">
                          {group.title}
                        </span>
                      </div>

                      <div className="shrink-0 text-xs text-[#667085]">
                        {group.nodeType}&nbsp;&nbsp;
                        {intl.formatMessage({
                          id: "pages.checklist.nodeSuffix",
                          defaultMessage: "node",
                        })}
                      </div>
                    </div>
                  </div>

                  {group.items.map((item: any, index: any) => (
                    <div
                      key={index}
                      className="border-t border-[rgb(16_24_40/0.08)] bg-[linear-gradient(to_right,rgba(247,144,9,0.08),transparent)]"
                    >
                      <div className="px-3 py-1.5">
                        <WarningOutlined className="text-[rgb(247,144,9)]" />
                        <span className="ml-1 text-xs text-[#676f83]">
                          {item.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                暂无校验问题
              </div>
            )}
          </div>
        </div>
      }
    >
      <div
        className={`${triggerClassName} relative`}
        role="button"
        tabIndex={0}
      >
        <Check size={15} strokeWidth={1.9} />
        <span className="ml-1">校验</span>

        {hasIssues ? (
          <div className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-amber-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm">
            {checkStat.total}
          </div>
        ) : (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-emerald-500 text-white shadow-sm">
            <CheckCheck size={10} strokeWidth={2.4} />
          </div>
        )}
      </div>
    </Popover>
  );
};
