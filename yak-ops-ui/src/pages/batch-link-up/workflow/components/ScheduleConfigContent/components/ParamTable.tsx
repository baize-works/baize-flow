import { TimeParamItem } from "@/pages/knowledge-management/types";
import { InfoCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Input, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";

const { Option } = Select;

const inputStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 16,
  borderColor: "#D0D5DD",
  background: "#FCFCFD",
  boxShadow: "none",
};

interface ParamTableProps {
  dataSource: TimeParamItem[];
  onChange?: (nextDataSource: any) => void;
  onDelete: (record: any) => void;
  timeVariableKeys: any[];
}

const ParamTable: React.FC<ParamTableProps> = ({
  dataSource,
  onChange,
  onDelete,
  timeVariableKeys,
}) => {
  const handleFieldChange = (
    rowKey: React.Key,
    field: keyof TimeParamItem,
    fieldValue: string
  ) => {
    const nextDataSource = dataSource.map((item) => {
      if (item.key === rowKey) {
        const selectedItem = timeVariableKeys.find(
          (option) => option.value === fieldValue
        );
        const newParamValue = selectedItem ? selectedItem.description : ""; 
        return {
          ...item,
          [field]: fieldValue,
          paramValue: newParamValue,
        };
      }
      return item;
    });

    const updatedItem = nextDataSource.find((item) => item.key === rowKey);

    if (updatedItem) {
      onChange?.(updatedItem);
    }
  };

  const columns: ColumnsType<TimeParamItem> = [
    {
      title: <span style={{ fontSize: 13, fontWeight: 500 }}>参数名</span>,
      dataIndex: "paramName",
      key: "paramName",
      width: "48%",
      render: (value: string, record: any) => {
        return (
          <Select
            style={{ width: "100%" }}
            placeholder="时间参数"
            value={value}
            options={timeVariableKeys}
            onChange={(value) =>
              handleFieldChange(record.key, "paramName", value)
            }
          />
        );
      },
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          参数值{" "}
          <Tooltip title="支持使用时间表达式，例如 ${add_months(yyyymmdd,-1)}">
            <InfoCircleOutlined className="text-[12px] text-[#98A2B3]" />
          </Tooltip>
        </span>
      ),
      dataIndex: "paramValue",
      key: "paramValue",
      width: "50%",
      render: (value: string, record: any) => (
        <Input
          size="small"
          value={value}
          placeholder="请输入参数值或表达式"
          style={inputStyle}
          disabled
        />
      ),
    },
    {
      title: <></>,
      key: "action",
      width: "2%",
      render: (_, record: any) => (
        <a
          className="schedule-table-action"
          onClick={() => onDelete(record.key)}
        >
          <MinusCircleOutlined />
        </a>
      ),
    },
  ];

  return (
    <div className="schedule-table-card">
      <Table<TimeParamItem>
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default ParamTable;
