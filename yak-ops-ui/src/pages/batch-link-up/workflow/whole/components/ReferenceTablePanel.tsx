import React from "react";
import { Spin, Table } from "antd";
import type { TableItem } from "../types";

interface Props {
  loading: boolean;
  data: TableItem[];
}

const ReferenceTablePanel: React.FC<Props> = ({ loading, data }) => {
  return (
    <div style={{ width: "58.8vh", marginLeft: "6%", marginBottom: 12 }}>
      <Spin spinning={loading}>
        <Table
          dataSource={data}
          loading={loading}
          bordered
          scroll={{ x: "max-content", y: 300 }}
          pagination={false}
          columns={[
            {
              title: "表名",
              dataIndex: "title",
              key: "title",
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default ReferenceTablePanel;