import { Empty, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import { BLUE, BORDER_COLOR } from "../../constants/ui";
import { MenuKey, ParamItem, TimeParamItem } from "../../types";

const { Text } = Typography;

interface Props {
  activeMenu: MenuKey;
  dataSource: ParamItem[];
  loading?: boolean;
  pagination?: any;
  onEdit: (record: ParamItem) => void;
  onDelete: (record: ParamItem) => void;
}

const sourceTextMap: Record<string, string> = {
  SYSTEM: "系统内置",
  CUSTOM: "自定义",
};

const valueTypeTextMap: Record<string, string> = {
  FIXED: "固定值",
  DYNAMIC: "动态表达式",
};

const actionStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  padding: "4px 10px",
  borderRadius: 8,
  border: "none",
  outline: "none",
  transition: "all 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  transform: "translateY(0) scale(1)",
};

const TimeParamTable: React.FC<Props> = ({
  dataSource,
  loading,
  pagination,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<ParamItem> = [
    {
      title: "变量名",
      dataIndex: "paramName",
      key: "paramName",
      width: 220,
      render: (value: string, record) => {
        const item = record as TimeParamItem;

        return (
          <div>
            <div style={{ fontWeight: 600, color: "#101828", lineHeight: 1.4 }}>
              {value}
            </div>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Tag
                style={{
                  marginInlineEnd: 0,
                  borderRadius: 999,
                  color:
                    item.variableSource === "SYSTEM" ? "#6941C6" : "#3478f6",
                  background:
                    item.variableSource === "SYSTEM" ? "#F4F3FF" : "#EFF6FF",
                  borderColor:
                    item.variableSource === "SYSTEM" ? "#D9D6FE" : "#BFDBFE",
                }}
              >
                {sourceTextMap[item.variableSource] || item.variableSource}
              </Tag>

              {item.enabled === false && (
                <Tag
                  style={{
                    marginInlineEnd: 0,
                    borderRadius: 999,
                    color: "#667085",
                    background: "#F2F4F7",
                    borderColor: "#EAECF0",
                  }}
                >
                  已停用
                </Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "说明",
      dataIndex: "paramDesc",
      key: "paramDesc",
      ellipsis: true,
      render: (value: string) => (
        <Text style={{ color: "#475467" }}>{value || "-"}</Text>
      ),
    },
    {
      title: "取值方式",
      dataIndex: "valueType",
      key: "valueType",
      width: 130,
      render: (value: string) => (
        <Tag
          style={{
            borderRadius: 8,
            color: value === "DYNAMIC" ? "#047857" : "#475467",
            background: value === "DYNAMIC" ? "#ECFDF3" : "#F8FAFC",
            borderColor: value === "DYNAMIC" ? "#A7F3D0" : "#E4E7EC",
          }}
        >
          {valueTypeTextMap[value] || value || "-"}
        </Tag>
      ),
    },
    {
      title: "格式",
      dataIndex: "timeFormat",
      key: "timeFormat",
      width: 180,
      render: (value?: string) =>
        value ? (
          <Tag
            style={{
              borderRadius: 8,
              color: "#3478f6",
              background: "#eff6ff",
              borderColor: "#bfdbfe",
            }}
          >
            {value}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "动态表达式",
      dataIndex: "expression",
      key: "expression",
      width: 220,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "示例值",
      dataIndex: "exampleValue",
      key: "exampleValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_: unknown, record: ParamItem) => {
        const item = record as TimeParamItem;
        console.log(item);
        const isSystem = item.variableSource === "SYSTEM";

        return (
          <Space size={16}>
            <button
              type="button"
              className="connector-param-table__action connector-param-table__action--edit"
              onClick={() => onEdit(record)}
              style={{
                ...actionStyle,
                color: BLUE,
                background: "#F5F8FF",
              }}
            >
              {isSystem ? "查看" : "编辑"}
            </button>

            {!isSystem && (
              <button
                type="button"
                className="connector-param-table__action connector-param-table__action--edit"
                onClick={() => onDelete(record)}
                style={{
                  ...actionStyle,
                  color: "#D92D20",
                  background: "#FEF3F2",
                }}
              >删除</button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div
      style={{
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <Table<ParamItem>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        locale={{
          emptyText: (
            <div style={{ padding: "56px 0" }}>
              <Empty description="暂无时间变量" />
            </div>
          ),
        }}
        scroll={{ x: 1300, y: "calc(100vh - 430px)" }}
      />
    </div>
  );
};

export default TimeParamTable;
