import React from "react";
import { Spin, Transfer, type TransferProps } from "antd";
import type { TableItem } from "../types";

interface Props {
  loading: boolean;
  data: TableItem[];
  targetKeys: string[];
  matchMode: string;
  onChange: (keys: string[]) => void;
}

const TableTransferPanel: React.FC<Props> = ({
  loading,
  data,
  targetKeys,
  matchMode,
  onChange,
}) => {
  const renderFooter: TransferProps["footer"] = (_, info) => {
    const totalTables = data.length;
    const selectedTables = targetKeys.length;

    if (info?.direction === "left") {
      return (
        <div style={{ fontSize: 12, padding: "8px 12px" }}>
          {`Total: ${totalTables} tables`}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", fontSize: 12, padding: "8px 12px" }}>
        <span>{`已选 ${selectedTables} 个表`}</span>
        <span style={{ color: "red", marginLeft: 16 }}>
          Supports up to 100 tables
        </span>
      </div>
    );
  };

  return (
    <div style={{ padding: "0 6.1%" }}>
      <Spin spinning={loading}>
        <Transfer
          dataSource={data}
          listStyle={{ width: "100%", height: 400 }}
          operations={["", ""]}
          targetKeys={targetKeys}
          onChange={(nextKeys) => {
            if (matchMode === "4") return;
            onChange(nextKeys as string[]);
          }}
          render={(item) => item.title}
          footer={renderFooter}
          showSearch
          filterOption={(inputValue, item) =>
            item.rawTitle.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </Spin>
    </div>
  );
};

export default TableTransferPanel;