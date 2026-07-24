// components/RealtimeSyncPlan.tsx
import { selectDataSourceById } from "@/pages/data-source/service";
import { DoubleRightOutlined } from "@ant-design/icons";
import { Empty, Popover } from "antd";
import React, { CSSProperties, useState } from "react";

import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";

interface RealtimeSyncPlanProps {
  record: any;
}

const RealtimeSyncPlan: React.FC<RealtimeSyncPlanProps> = ({ record }) => {
  const [sourcePopoverVisible, setSourcePopoverVisible] = useState(false);
  const [sinkPopoverVisible, setSinkPopoverVisible] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);

  const animatedIconStyle: CSSProperties = {
    fontSize: 10,
    animation: "realtime-plan-flow 2s ease-in-out infinite",
    color: "hsl(231 48% 48%)",
  };

  const safeParse = (value: any) => {
    if (!value) return null;

    if (typeof value === "object") {
      return value;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    return null;
  };

  const getPlanTitle = () => {
    if (record?.mode === "GUIDE_SINGLE") return "单表同步";
    if (record?.mode === "GUIDE_MULTI") return "多表同步";
    if (record?.mode === "SCRIPT") return "脚本模式";
    return "实时同步";
  };

  const formatTables = (tableValue: any, fallback = "-") => {
    if (!tableValue) return fallback;

    if (typeof tableValue === "string") {
      const trimmed = tableValue.trim();

      if (!trimmed) return fallback;

      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
      }

      const parsed = safeParse(trimmed);
      if (!parsed) return trimmed;

      tableValue = parsed;
    }

    if (Array.isArray(tableValue)) {
      if (!tableValue.length) return fallback;
      if (tableValue.length === 1) return tableValue[0];
      return `${tableValue[0]} +${tableValue.length - 1} more`;
    }

    if (typeof tableValue === "object") {
      const tables: string[] = [];

      Object.values(tableValue).forEach((item: any) => {
        if (Array.isArray(item)) {
          tables.push(...item);
        } else if (typeof item === "string" && item.trim()) {
          tables.push(item.trim());
        }
      });

      if (!tables.length) return fallback;
      if (tables.length === 1) return tables[0];
      return `${tables[0]} +${tables.length - 1} more`;
    }

    return fallback;
  };

  const getTableList = (tableValue: any): string[] => {
    if (!tableValue) return [];

    let value = tableValue;

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return [];

      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return [trimmed];
      }

      const parsed = safeParse(trimmed);
      if (!parsed) return [trimmed];

      value = parsed;
    }

    if (Array.isArray(value)) {
      return value
        .filter((item) => String(item || "").trim())
        .map((item) => String(item).trim());
    }

    if (typeof value === "object") {
      const tables: string[] = [];

      Object.entries(value).forEach(([schemaName, item]: any) => {
        if (Array.isArray(item)) {
          item.forEach((tableName) => {
            if (String(tableName || "").trim()) {
              tables.push(
                schemaName
                  ? `${schemaName}.${String(tableName).trim()}`
                  : String(tableName).trim()
              );
            }
          });
        }

        if (typeof item === "string" && item.trim()) {
          tables.push(schemaName ? `${schemaName}.${item.trim()}` : item.trim());
        }
      });

      return tables;
    }

    return [];
  };

  const sourceTableList = getTableList(record?.sourceTable);
  const sinkTableList = getTableList(record?.sinkTable);

  const sourceTableText = formatTables(record?.sourceTable, "暂未配置来源表");
  const sinkTableText = formatTables(record?.sinkTable, "暂未配置目标表");

  const renderValue = (value: any): React.ReactNode => {
    if (value === null) return <span className="text-gray-400">null</span>;

    if (typeof value === "string") {
      return <span className="text-emerald-600">"{value}"</span>;
    }

    if (typeof value === "number") {
      return <span className="text-amber-500">{value}</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={value ? "text-blue-600" : "text-red-500"}>
          {String(value)}
        </span>
      );
    }

    return <span className="text-gray-700">{String(value)}</span>;
  };

  const renderObject = (obj: any, level = 0): React.ReactNode => {
    if (typeof obj !== "object" || obj === null) {
      return renderValue(obj);
    }

    const isArray = Array.isArray(obj);
    const indent = level * 14;

    return (
      <div>
        <div style={{ paddingLeft: indent }} className="text-gray-400">
          {isArray ? "[" : "{"}
        </div>

        {Object.entries(obj).map(([key, value]) => (
          <div
            key={key}
            style={{ paddingLeft: indent + 14 }}
            className="leading-5"
          >
            {!isArray && (
              <>
                <span className="text-purple-600">"{key}"</span>
                <span className="text-gray-400">: </span>
              </>
            )}

            {typeof value === "object" && value !== null
              ? renderObject(value, level + 1)
              : renderValue(value)}
          </div>
        ))}

        <div style={{ paddingLeft: indent }} className="text-gray-400">
          {isArray ? "]" : "}"}
        </div>
      </div>
    );
  };

  const renderJsonPopoverContent = () => {
    if (!jsonData) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      );
    }

    return (
      <div className="max-h-[320px] w-[340px] overflow-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 font-mono text-xs shadow-sm">
        {renderObject(jsonData)}
      </div>
    );
  };

  const renderTablePopoverContent = (tables: string[]) => {
    if (!tables.length) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无表信息" />
      );
    }

    return (
      <div className="max-h-[280px] w-[300px] overflow-y-auto">
        <div className="mb-2 text-xs text-black/45">共 {tables.length} 张表</div>

        <div className="flex flex-col gap-1.5">
          {tables.map((tableName, index) => (
            <div
              key={`${tableName}-${index}`}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-xs leading-5 text-slate-700"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-slate-700" />
              <span className="truncate" title={tableName}>
                {tableName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleOpenDatasource = async (
    datasourceId: string | number | undefined,
    type: "source" | "sink"
  ) => {
    if (!datasourceId) return;

    const data = await selectDataSourceById(datasourceId);

    if (data?.code === 0) {
      setJsonData(safeParse(data?.data?.connectionParams || {}));

      if (type === "source") {
        setSourcePopoverVisible(true);
      } else {
        setSinkPopoverVisible(true);
      }
    }
  };

  const renderDatasourceName = (
    type: "source" | "sink",
    datasourceId?: string | number,
    datasourceName?: string,
    fallback?: string
  ) => {
    return (
      <Popover
        open={type === "source" ? sourcePopoverVisible : sinkPopoverVisible}
        onOpenChange={(visible) => {
          if (type === "source") {
            setSourcePopoverVisible(visible);
          } else {
            setSinkPopoverVisible(visible);
          }
        }}
        title="数据源信息"
        content={renderJsonPopoverContent()}
        trigger="click"
        placement="right"
      >
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            handleOpenDatasource(datasourceId, type);
          }}
          className="ml-2 max-w-[150px] truncate text-[13px] font-medium"
          style={{ color: "hsl(231 48% 48%)" }}
          title={datasourceName || fallback}
        >
          {datasourceName || fallback || "-"}
        </a>
      </Popover>
    );
  };

  const renderTableText = (
    tables: string[],
    text: string,
    emptyText: string,
    title: string
  ) => {
    if (record?.mode === "GUIDE_MULTI") {
      return (
        <Popover
          placement="rightTop"
          trigger="hover"
          title={title}
          content={renderTablePopoverContent(tables)}
        >
          <span
            className={[
              "inline-block max-w-[180px] cursor-pointer truncate text-[13px]",
              tables.length ? "text-slate-700" : "text-slate-400",
            ].join(" ")}
          >
            {tables.length ? `共 ${tables.length} 张表` : emptyText}
          </span>
        </Popover>
      );
    }

    return (
      <span
        className="inline-block max-w-[180px] truncate text-[13px] text-slate-700"
        title={text}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="min-w-[280px] text-slate-700" style={{padding: "12px 0"}}>
      <style>
        {`
          @keyframes realtime-plan-flow {
            0%, 100% { transform: translateY(0px) rotate(90deg); opacity: .55; }
            50% { transform: translateY(-7px) rotate(90deg); opacity: 1; }
          }
        `}
      </style>

      <div className="mb-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50/70 px-3 py-1 text-[11px] font-medium shadow-sm shadow-violet-100/40"
          style={{ color: "hsl(231 48% 48%)" }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: "hsl(231 48% 48%)" }}
          />
          {getPlanTitle()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          {record?.sourceType ? (
            <>
              <DatabaseIcons dbType={record.sourceType} width="24" height="24" />
              {renderDatasourceName(
                "source",
                record?.sourceDatasourceId,
                record?.sourceDatasourceName,
                record?.sourceType
              )}
            </>
          ) : (
            <span className="text-slate-400">-</span>
          )}

          <span className="mx-2 text-emerald-500">·</span>

          {renderTableText(
            sourceTableList,
            sourceTableText,
            "暂未选择表",
            "来源表清单"
          )}
        </div>

        <div className="pl-2">
          <DoubleRightOutlined style={animatedIconStyle} />
        </div>

        <div className="flex items-center">
          {record?.sinkType ? (
            <>
              <DatabaseIcons dbType={record.sinkType} width="24" height="24" />
              {renderDatasourceName(
                "sink",
                record?.sinkDatasourceId,
                record?.sinkDatasourceName,
                record?.sinkType
              )}
            </>
          ) : (
            <span className="text-slate-400">-</span>
          )}

          <span className="mx-2 text-slate-300">·</span>

          {renderTableText(
            sinkTableList,
            sinkTableText,
            "暂未选择表",
            "目标表清单"
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeSyncPlan;