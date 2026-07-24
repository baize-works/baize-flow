import {
  generateCDCDataSourceOptions,
  generateDataSourceOptions,
} from "@/pages/batch-link-up/DataSourceSelect";
import { ThunderboltOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import React from "react";
import RealtimeFlowBridge from "./RealtimeFlowBridge";

interface RealtimeHeaderProps {
  sourceType: any;
  sinkType: any;
  onSourceChange: (value: any) => void;
  onSinkChange: (value: any) => void;
  onCreate: () => void;
  creating?: boolean;
}

const RealtimeHeader: React.FC<RealtimeHeaderProps> = ({
  sourceType,
  sinkType,
  onSourceChange,
  onSinkChange,
  onCreate,
  creating = false,
}) => {
  const handleSourceChange = (value: string, option: any) => {
    onSourceChange({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleSinkChange = (value: string, option: any) => {
    onSinkChange({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const isButtonDisabled = !sourceType?.dbType || !sinkType?.dbType;

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex items-center justify-center text-indigo-600"
          style={{
            backgroundColor: "#eef2ff",
            height: 44,
            width: 44,
            fontSize: 20,
            borderRadius: 14,
          }}
        >
          <ThunderboltOutlined />
        </div>

        <div>
          <h1
            className="m-0 font-bold tracking-tight text-slate-950"
            style={{ fontSize: 18, lineHeight: "26px" }}
          >
            实时同步任务
          </h1>
          <p className="mt-1 text-slate-500" style={{ fontSize: 13 }}>
            持续采集与实时处理数据流，帮助你更快构建端到端流式同步链路
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-indigo-100 bg-white/90 p-4">
        <div className="mb-1 flex items-center gap-3 font-semibold text-slate-900 st-font">
          同步方向
        </div>

        <div className="grid grid-cols-[minmax(240px,1fr)_120px_minmax(240px,1fr)_180px] items-center gap-4 max-xl:grid-cols-1">
          <div
            className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition
            hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)]"
          >
            <Select
              prefix="来源："
              value={sourceType?.dbType}
              onChange={handleSourceChange}
              options={generateCDCDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <RealtimeFlowBridge />

          <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
            <Select
              prefix="去向："
              value={sinkType?.dbType}
              onChange={handleSinkChange}
              options={generateDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <Button
            type="primary"
            disabled={isButtonDisabled}
            loading={creating}
            onClick={onCreate}
            className="h-10 rounded-full border-none bg-gradient-to-r font-semibold"
          >
            创建实时任务
          </Button>
        </div>

        {/* <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          常用组合：
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐬 MySQL → Kafka
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐘 PostgreSQL → Kafka
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐬 MySQL CDC → Elasticsearch
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            ✣ Kafka → StarRocks
          </span>
        </div> */}
      </div>
    </>
  );
};

export default RealtimeHeader;
