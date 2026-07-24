import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { memo } from "react";

interface FieldMapperInitGuideProps {
  onRefresh?: () => void;
}

const steps = [
  "打开上游 Source 节点",
  "选择表或填写 Query",
  "点击字段解析",
];

function FieldMapperInitGuide({ onRefresh }: FieldMapperInitGuideProps) {
  return (
    <div className="rounded-[22px] bg-whiteshadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="rounded-[18px] bg-gradient-to-b from-blue-50/80 to-white px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]">
            i
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold leading-5 text-slate-900">
              先解析上游字段
            </div>

            <div className="mt-1 text-xs leading-5 text-slate-500">
              在上游节点完成字段解析后，这里会自动显示字段映射。
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                {index + 1}
              </div>

              <div className="text-[13px] font-medium leading-5 text-slate-700">
                {step}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-start">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            className="!h-8 !rounded-full !border-blue-100 !bg-white !px-4 !text-xs !font-semibold !text-slate-700 shadow-sm hover:!border-blue-300 hover:!text-blue-600"
          >
            重新检测
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(FieldMapperInitGuide);