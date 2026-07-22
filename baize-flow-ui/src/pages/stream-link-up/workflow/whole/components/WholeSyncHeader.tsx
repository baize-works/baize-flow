import React from "react";
import { Breadcrumb } from "antd";

import type { DbType } from "../types";
import DataSourceSelect, { generateDataSourceOptions } from "@/pages/batch-link-up/DataSourceSelect";
import IconRightArrow from "@/pages/batch-link-up/IconRightArrow";

interface Props {
  sourceType: DbType;
  targetType: DbType;
  onSourceChange: (value: string, option: any) => void;
  onTargetChange: (value: string, option: any) => void;
  goBack: () => void;
}

const WholeSyncHeader: React.FC<Props> = ({
  sourceType,
  targetType,
  onSourceChange,
  onTargetChange,
  goBack,
}) => {
  return (
    <div className="jy-dc-ui-pro-header">
      <div style={{ padding: "8px 16px 0 16px" }}>
        <Breadcrumb
          items={[
            {
              title: (
                <a style={{ fontSize: 12 }} onClick={goBack}>
                  任务列表
                </a>
              ),
            },
            { title: <span style={{ fontSize: 12 }}>多表同步</span> },
          ]}
        />
      </div>

      <div
        className="jy-dc-ui-pro-header-footer"
        style={{ padding: "12px 16px 16px" }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <DataSourceSelect
            value={sourceType}
            onChange={onSourceChange}
            placeholder="来源"
            prefix="来源: "
            width="48%"
            dataSourceOptions={generateDataSourceOptions()}
          />
          <div style={{ display: "flex", alignItems: "center", margin: "0 8px" }}>
            <IconRightArrow />
          </div>
          <DataSourceSelect
            value={targetType}
            onChange={onTargetChange}
            placeholder="去向"
            prefix="去向: "
            width="48%"
            dataSourceOptions={generateDataSourceOptions()}
          />
        </div>
      </div>
    </div>
  );
};

export default WholeSyncHeader;