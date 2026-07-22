import { ArrowRightOutlined, SunOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Select } from "antd";
import React from "react";
import { generateDataSourceOptions } from "../../DataSourceSelect";
import "./index.less";

interface DataSyncHeaderProps {
  goDetail: (value: any) => void;
  sourceType: any;
  targetType: any;
  setSourceType: (value: any) => void;
  setTargetType: (value: any) => void;
}

export interface SyncParams {
  sourceType: string;
  targetType: string;
}

const DataSyncHeader: React.FC<DataSyncHeaderProps> = ({
  goDetail,
  sourceType,
  setSourceType,
  targetType,
  setTargetType,
}) => {
  const intl = useIntl();

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleCreateClick = () => {
    goDetail(undefined);
  };

  const isButtonDisabled = !sourceType || !targetType;

  return (
    <div className="sync-page-header">
      <div className="sync-page-header__top" style={{ marginBottom: 16 }}>
        <div className="sync-page-header__meta">
          <div className="sync-page-header__icon">
            <SunOutlined />
          </div>

          <div className="sync-page-header__text">
            <div className="sync-page-header__title">
              {intl.formatMessage({
                id: "pages.datasync.header.title",
                defaultMessage: "离线同步任务",
              })}
            </div>
            <div className="sync-page-header__subtitle">
              {intl.formatMessage({
                id: "pages.datasync.header.subtitle",
                defaultMessage: "选择同步方向，快速创建新的离线同步任务",
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-indigo-100 bg-white/90 p-4 ">
        <div className="mb-2 flex items-center gap-3 font-semibold text-slate-900 st-web-font">
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
              options={generateDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-900 max-xl:justify-start">
            <ArrowRightOutlined />
          </div>

          <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
            <Select
              prefix="去向："
              value={targetType?.dbType}
              onChange={handleTargetChange}
              options={generateDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <Button
            type="primary"
            disabled={isButtonDisabled}
            onClick={handleCreateClick}
            className="h-10 rounded-full border-none bg-gradient-to-r  font-semibold "
          >
            创建离线任务
          </Button>
        </div>

        {/* <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          常用组合：
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐬 MySQL → Oracle
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐘 PostgreSQL → MySQL
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🔶 Oracle → MySQL
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            ⭐ MySQL → PostgreSQL
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default DataSyncHeader;
