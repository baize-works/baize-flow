import { Input } from "antd";

interface BasicConfigContentProps {
  params?: any;
  value?: any;
  onChange?: React.Dispatch<React.SetStateAction<any>>;
}

const { TextArea } = Input;

const getModeLabel = (mode?: string) => {
  switch (mode) {
    case "GUIDE_SINGLE":
      return "单表同步";
    case "GUIDE_MULTI":
      return "多表同步";
    case "SCRIPT":
      return "脚本模式";
    default:
      return mode || "-";
  }
};

export default function BasicConfigContent({
  value,
  onChange,
}: BasicConfigContentProps) {
  const sourceType = value?.sourceType || "SOURCE";
  const targetType = value?.targetType || "SINK";
  const jobName = value?.jobName || "";
  const jobDesc = value?.jobDesc || "";
  const clientId = value?.clientId || "-";
  const modeLabel = getModeLabel(value?.mode);

  console.warn("123" + value)

  const handleFieldChange = (field: string, fieldValue: any) => {
    onChange?.((prev: any) => ({
      ...prev,
      [field]: fieldValue,
    }));
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
      <div className="space-y-5">
        <div
          className="flex items-start justify-between gap-4"
          style={{ alignItems: "center" }}
        >
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-slate-400">
              任务概览
            </div>
          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-600">
            {modeLabel}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between text-center">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Source</div>
              <div className="mt-1 text-[15px] font-semibold text-slate-900">
                {sourceType}
              </div>
            </div>

            <div className="px-3 text-slate-300">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="block"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Sink</div>
              <div className="mt-1 text-[15px] font-semibold text-slate-900">
                {targetType}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[12px] text-slate-400">名称</div>
            <Input
              value={jobName}
              placeholder="请输入任务名称"
              onChange={(e) => handleFieldChange("jobName", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <div className="text-[12px] text-slate-400">说明</div>
            <TextArea
              value={jobDesc}
              placeholder="请输入任务说明"
              autoSize={{ minRows: 3, maxRows: 5 }}
              onChange={(e) =>
                handleFieldChange("jobDesc", e.target.value)
              }
              className="mt-1"
            />
          </div>

          <div>
            <div className="text-[12px] text-slate-400">Zeta</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[15px] font-semibold leading-none text-slate-700">
                #{clientId}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                已绑定
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
