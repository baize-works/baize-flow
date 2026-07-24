import { InputNumber, Select } from "antd";
import { Activity, Gauge, TimerReset } from "lucide-react";

interface EnvConfigContentProps {
  value?: {
    jobMode?: "BATCH" | "STREAMING";
    parallelism?: number;
    checkpointInterval?: number;
  };
  onChange?: React.Dispatch<React.SetStateAction<any>>;
}

const JOB_MODE_OPTIONS = [
  {
    label: "STREAMING",
    value: "STREAMING",
  },
];

export default function EnvConfigContent({
  value,
  onChange,
}: EnvConfigContentProps) {
  const jobMode = value?.jobMode || "STREAMING";
  const parallelism = value?.parallelism ?? 1;
  const checkpointInterval = value?.checkpointInterval ?? 30000;

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
              运行环境
            </div>
          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-600">
            Env
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Activity size={16} strokeWidth={1.9} />
              </div>

              <div className="min-w-0">
                <div className="text-[11px] text-slate-400">Job Mode</div>
                <div className="mt-1 text-[15px] font-semibold text-slate-900">
                  {jobMode}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                并行度 {parallelism}
              </div>

              <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                Checkpoint {checkpointInterval}ms
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 text-[12px] text-slate-400">运行模式</div>
            <Select
              value={jobMode}
              options={JOB_MODE_OPTIONS}
              onChange={(nextValue) => handleFieldChange("jobMode", nextValue)}
              className="w-full"
            />
            <div className="mt-1.5 text-[11px] leading-5 text-slate-400">
              BATCH 适合离线批处理任务，STREAMING 适合持续运行的流式任务。
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12px] text-slate-400">并行度</div>
            <InputNumber
              min={1}
              max={1024}
              precision={0}
              value={parallelism}
              onChange={(nextValue) =>
                handleFieldChange("parallelism", nextValue || 1)
              }
              className="w-full"
            />
            <div className="mt-1.5 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <Gauge
                size={13}
                strokeWidth={1.8}
                className="mt-[3px] shrink-0"
              />
              <span>
                并行度会影响 Source/Sink 的执行并发，建议先使用较小值验证链路稳定性。
              </span>
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12px] text-slate-400">
              Checkpoint 间隔
            </div>
            <InputNumber
              min={1000}
              max={86_400_000}
              step={1000}
              precision={0}
              suffix="ms"
              value={checkpointInterval}
              onChange={(nextValue) =>
                handleFieldChange("checkpointInterval", nextValue || 30000)
              }
              className="w-full"
            />
            <div
              className="mt-1.5 flex items-start gap-2 text-[11px] leading-5 text-slate-400"
              style={{ paddingBottom: 12 }}
            >
              <TimerReset
                size={15}
                strokeWidth={1.8}
                className="mt-[3px] shrink-0"
              />
              <span>
                Checkpoint 间隔用于控制流式任务状态快照频率，默认 30000ms，建议根据数据量与资源情况调整。
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}