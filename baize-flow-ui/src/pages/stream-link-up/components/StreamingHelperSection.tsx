import React from "react";
import {
  CheckCircleOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  RightOutlined,
  SettingOutlined,
} from "@ant-design/icons";

interface StepItem {
  step: string;
  title: string;
  icon: React.ReactNode;
}

const steps: StepItem[] = [
  {
    step: "第 1 步",
    title: "选择来源",
    icon: <DatabaseOutlined />,
  },
  {
    step: "第 2 步",
    title: "选择去向",
    icon: <NodeIndexOutlined />,
  },
  {
    step: "第 3 步",
    title: "配置任务",
    icon: <SettingOutlined />,
  },
  {
    step: "第 4 步",
    title: "开始运行",
    icon: <CheckCircleOutlined />,
  },
];

const StreamingHelperSection: React.FC = () => {
  return (
    <div className="mb-5 rounded-[20px]  bg-white  py-4 ">
      <h3 className="mb-4 text-sm font-bold text-slate-900">
        实时任务创建流程
      </h3>

      <div className="flex items-stretch justify-between gap-3 max-xl:grid max-xl:grid-cols-2 max-md:grid-cols-1">
        {steps.map((item, index) => {
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={item.step}>
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-indigo-100 hover:bg-slate-50/60">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-base text-indigo-500">
                  {item.icon}
                </div>

                <div className="mb-1 text-xs font-semibold text-slate-900">
                  {item.step}
                </div>

                <div className="text-xs text-slate-500">{item.title}</div>
              </div>

              {!isLast && (
                <div className="flex w-5 shrink-0 items-center justify-center text-slate-300 max-xl:hidden">
                  <RightOutlined className="text-[11px]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingHelperSection;