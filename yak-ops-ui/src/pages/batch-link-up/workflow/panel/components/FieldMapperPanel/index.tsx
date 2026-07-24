import { HolderOutlined } from "@ant-design/icons";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MenuProps, TableColumnsType } from "antd";
import { Button, Dropdown, Input, Space, Table, message } from "antd";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PanelShell from "../PanelShell";
import FieldMapperInitGuide from "./FieldMapperInitGuide";

interface FieldMapperLinkedNodeIds {
  sourceNodeId?: string;
  sinkNodeId?: string;
}

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  getFieldMapperLinkedNodeIds: (nodeId: string) => FieldMapperLinkedNodeIds;
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
  syncTransformPluginConfig: (nodeId: string) => {
    pluginInput?: string;
    pluginOutput?: string;
  };
}

interface FieldMappingRow {
  key: string;
  sourceFieldName: string;
  sinkFieldName: string;
  sourceFieldType?: string;
  enabled: boolean;
}

interface SchemaField {
  id: string;
  name: string;
  type?: string;
  nullable?: string;
  comment?: string;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const RowContext = React.createContext<RowContextProps>({});

const buildFieldId = (prefix: string, index: number, name?: string) =>
  `${prefix}_${name || "field"}_${index}`;

const normalizeSchemaToList = (
  schema: any[] = [],
  prefix: string
): SchemaField[] =>
  schema
    .map((field: any, index) => ({
      id:
        field?.id ||
        buildFieldId(prefix, index, field?.originFieldName || field?.name),
      name: field?.originFieldName || field?.name || "",
      type: field?.type || "",
      nullable: field?.nullable,
      comment: field?.comment || "",
    }))
    .filter((field) => !!field.name);

const buildRowsFromSchema = (schemaFields: SchemaField[]): FieldMappingRow[] =>
  schemaFields.map((field, index) => ({
    key: `mapping_${field.name || "field"}_${index}`,
    sourceFieldName: field.name,
    sinkFieldName: field.name,
    sourceFieldType: field.type || "",
    enabled: true,
  }));

const buildRowsFromMappings = (
  mappings: any[] = [],
  schemaFields: SchemaField[] = []
): FieldMappingRow[] => {
  if (!mappings.length) {
    return buildRowsFromSchema(schemaFields);
  }

  const sourceTypeMap = new Map(
    schemaFields.map((item) => [item.name, item.type || ""])
  );

  return mappings.map((item: any, index) => ({
    key: item?.id || `mapping_${index}`,
    sourceFieldName: item?.sourceField || "",
    sinkFieldName: item?.targetField || item?.sourceField || "",
    sourceFieldType:
      sourceTypeMap.get(item?.sourceField) || item?.targetType || "",
    enabled: item?.enabled !== false,
  }));
};

function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay = 300
): T {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      className="!cursor-move !text-slate-500 hover:!bg-blue-50 hover:!text-blue-600"
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 999,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          background: "#fff",
        }
      : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

function FieldMapperPanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  getFieldMapperLinkedNodeIds,
  refreshNodeSchema,
  refreshDownstreamSchemas,
  syncTransformPluginConfig,
}: Props) {
  const nodeId = selectedNode?.id;

  const title =
    selectedNode?.data?.title || selectedNode?.data?.label || "字段映射";

  const description =
    selectedNode?.data?.description || "配置来源字段与目标字段的映射关系";

  const passThroughUnmapped =
    selectedNode?.data?.config?.passThroughUnmapped ?? true;

  const [rows, setRows] = useState<FieldMappingRow[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<string>();
  const [menuOpen, setMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const upstreamSchema = useMemo(() => {
    if (!nodeId) return [];
    return getDirectUpstreamSchema(nodeId) || [];
  }, [nodeId, getDirectUpstreamSchema]);

  const inputSchema = useMemo(() => {
    const currentInput =
      selectedNode?.data?.meta?.inputSchema?.length > 0
        ? selectedNode?.data?.meta?.inputSchema
        : upstreamSchema;

    return normalizeSchemaToList(currentInput, "input");
  }, [selectedNode?.data?.meta?.inputSchema, upstreamSchema]);

  const linkedNodeIds = useMemo(() => {
    if (!nodeId) {
      return {};
    }

    return getFieldMapperLinkedNodeIds?.(nodeId) || {};
  }, [nodeId, getFieldMapperLinkedNodeIds]);

  const pluginInput = linkedNodeIds.sourceNodeId;
  const pluginOutput = linkedNodeIds.sinkNodeId;

  const hasInputSchema = inputSchema.length > 0;

  useEffect(() => {
    const mappings = selectedNode?.data?.config?.mappings || [];
    setRows(buildRowsFromMappings(mappings, inputSchema));
  }, [selectedNode?.data?.config?.mappings, inputSchema]);

  const applyRows = useCallback(
    (nextRows: FieldMappingRow[], silent = true) => {
      if (!nodeId) {
        if (!silent) {
          message.warning("当前节点不存在");
        }
        return false;
      }

      if (!nextRows.length) {
        if (!silent) {
          message.warning("请至少保留一条有效字段映射");
        }
        return false;
      }

      const hasInvalidRow = nextRows.some(
        (item) => !item.sourceFieldName?.trim() || !item.sinkFieldName?.trim()
      );

      if (hasInvalidRow) {
        if (!silent) {
          message.warning("请补全字段映射后再应用");
        }
        return false;
      }

      const syncedPluginConfig = syncTransformPluginConfig(nodeId);

      const nextPluginInput = syncedPluginConfig.pluginInput;
      const nextPluginOutput = syncedPluginConfig.pluginOutput;

      if (!nextPluginInput) {
        if (!silent) {
          message.warning("请先连接上游节点");
        }
        return false;
      }

      if (!nextPluginOutput) {
        if (!silent) {
          message.warning("请先连接下游节点");
        }
        return false;
      }

      const nextMappings = nextRows.map((item, index) => ({
        id: item.key || `mapping_${index}`,
        sourceField: item.sourceFieldName.trim(),
        targetField: item.sinkFieldName.trim(),
        targetType: item.sourceFieldType || "",
        expression: "",
        enabled: item.enabled !== false,
      }));

      const outputSchema = nextRows.map((item) => ({
        name: item.sinkFieldName.trim(),
        type: item.sourceFieldType || "",
      }));

      onNodeDataChange(nodeId, {
        config: {
          ...(selectedNode?.data?.config || {}),

          pluginInput: nextPluginInput,
          pluginOutput: nextPluginOutput,

          mappings: nextMappings,
          passThroughUnmapped,
        },
        meta: {
          ...(selectedNode?.data?.meta || {}),
          inputSchema: inputSchema.map((item) => ({
            name: item.name,
            type: item.type || "",
            nullable: item.nullable,
            comment: item.comment || "",
          })),
          outputSchema,
        },
      });

      refreshNodeSchema(nodeId);
      refreshDownstreamSchemas(nodeId);

      if (!silent) {
        message.success("字段映射已应用");
      }

      return true;
    },
    [
      nodeId,
      selectedNode?.data?.config,
      selectedNode?.data?.meta,
      passThroughUnmapped,
      inputSchema,
      syncTransformPluginConfig,
      onNodeDataChange,
      refreshNodeSchema,
      refreshDownstreamSchemas,
    ]
  );

  const debouncedApplyRows = useDebouncedCallback(
    (nextRows: FieldMappingRow[]) => {
      applyRows(nextRows, true);
    },
    400
  );

  const updateSinkFieldName = useCallback(
    (key: string, value: string) => {
      setRows((prev) => {
        const nextRows = prev.map((item) =>
          item.key === key ? { ...item, sinkFieldName: value } : item
        );

        debouncedApplyRows(nextRows);

        return nextRows;
      });
    },
    [debouncedApplyRows]
  );

  const handleRefreshSchema = useCallback(() => {
    if (!nodeId) {
      message.warning("当前节点不存在");
      return;
    }

    if (!pluginInput) {
      message.warning("请先连接上游数据源节点");
      return;
    }

    refreshNodeSchema(pluginInput);
    refreshNodeSchema(nodeId);
    refreshDownstreamSchemas(nodeId);

    message.info(
      "已重新检测字段。若仍为空，请确认上游节点已选择表或填写 query，并点击字段解析"
    );
  }, [nodeId, pluginInput, refreshNodeSchema, refreshDownstreamSchemas]);

  const handleSyncFields = useCallback(() => {
    if (!pluginInput) {
      message.warning("请先连接上游节点");
      return;
    }

    if (!pluginOutput) {
      message.warning("请先连接下游节点");
      return;
    }

    if (!inputSchema.length) {
      message.warning(
        "请先在上游节点选择表或填写 query，并点击字段解析"
      );
      return;
    }

    const nextRows = buildRowsFromSchema(inputSchema);

    setRows(nextRows);
    applyRows(nextRows, true);

    message.success("已按输入字段同步");
  }, [pluginInput, pluginOutput, inputSchema, applyRows]);

  const handleDeleteRow = useCallback(
    (key: string) => {
      setRows((prev) => {
        const nextRows = prev.filter((item) => item.key !== key);

        debouncedApplyRows(nextRows);

        return nextRows;
      });
    },
    [debouncedApplyRows]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      setRows((prev) => {
        const oldIndex = prev.findIndex((item) => item.key === active.id);
        const newIndex = prev.findIndex((item) => item.key === over.id);

        if (oldIndex < 0 || newIndex < 0) {
          return prev;
        }

        const nextRows = arrayMove(prev, oldIndex, newIndex);

        debouncedApplyRows(nextRows);

        return nextRows;
      });
    },
    [debouncedApplyRows]
  );

  const handleApply = useCallback(() => {
    applyRows(rows, false);
  }, [rows, applyRows]);

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "delete",
        label: "删除",
        danger: true,
        onClick: () => {
          if (!selectedRowKey) return;

          handleDeleteRow(selectedRowKey);
          setMenuOpen(false);
          message.success("已删除该字段");
        },
      },
    ],
    [selectedRowKey, handleDeleteRow]
  );

  const SinkFieldInput = useMemo(() => {
    const InputComponent: React.FC<{
      value: string;
      onChange: (value: string) => void;
    }> = ({ value, onChange }) => {
      const [inputValue, setInputValue] = useState(value);

      useEffect(() => {
        setInputValue(value);
      }, [value]);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
      };

      return (
        <Input
          size="small"
          variant="filled"
          className="!w-full !rounded-xl "
          value={inputValue}
          placeholder="请输入目标字段名"
          onChange={handleChange}
          onContextMenu={(e) => e.stopPropagation()}
        />
      );
    };

    return InputComponent;
  }, []);

  const columns = useMemo<TableColumnsType<FieldMappingRow>>(
    () => [
      {
        key: "sort",
        align: "center",
        width: 24,
        render: () => <DragHandle />,
      },
      {
        title: "来源字段",
        dataIndex: "sourceFieldName",
        width: "42%",
        ellipsis: true,
        render: (_, record) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium text-slate-800">
              {record.sourceFieldName || "-"}
            </span>

            {/* {record.sourceFieldType && (
              <span className="truncate text-[11px] text-slate-400">
                {record.sourceFieldType}
              </span>
            )} */}
          </div>
        ),
      },
      {
        title: "目标字段",
        dataIndex: "sinkFieldName",
        width: "42%",
        ellipsis: true,
        render: (_, record) => (
          <SinkFieldInput
            value={record.sinkFieldName}
            onChange={(newValue) =>
              updateSinkFieldName(record.key, newValue)
            }
          />
        ),
      },
    ],
    [SinkFieldInput, updateSinkFieldName]
  );

  return (
    <PanelShell
      eyebrow="Transform Config"
      title="字段映射"
      badge="处理节点"
      desc="配置来源字段与目标字段的映射关系"
      heroTitle={title}
      heroDesc={description}
      heroTag="FIELDMAPPER"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="workflow-panel__btn workflow-panel__btn--ghost"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      <section className="rounded-[22px] border border-blue-100/80 mb-2.5  bg-white p-3 space-y-4">
        {!hasInputSchema ? (
          <FieldMapperInitGuide onRefresh={handleRefreshSchema} />
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Space wrap>
                  <Button
                    onClick={handleSyncFields}
                    className="!rounded-full !px-4 !font-medium"
                  >
                    同步字段
                  </Button>

                  <Button
                    type="primary"
                    onClick={handleApply}
                    className="!rounded-full !px-4 !font-medium"
                  >
                    手动应用
                  </Button>
                </Space>
              </div>

              <div className="mt-2 text-xs leading-5 text-slate-400">
                修改目标字段后会自动应用，右键某一行可快速删除该映射。
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Dropdown
                trigger={["contextMenu"]}
                open={menuOpen}
                onOpenChange={setMenuOpen}
                menu={{ items: menuItems }}
              >
                <div onContextMenu={(e) => e.preventDefault()}>
                  <DndContext
                    sensors={sensors}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={rows.map((item) => item.key)}
                      strategy={verticalListSortingStrategy}
                    >
                      <Table<FieldMappingRow>
                        rowKey="key"
                        className="field-mapper-table"
                        components={{ body: { row: Row } }}
                        columns={columns}
                        dataSource={rows}
                        pagination={false}
                        bordered={false}
                        size="middle"
                        onRow={(record) => ({
                          onContextMenu: (e) => {
                            e.preventDefault();
                            setSelectedRowKey(record.key);
                            setMenuOpen(true);
                          },
                        })}
                      />
                    </SortableContext>
                  </DndContext>
                </div>
              </Dropdown>
            </div>
          </>
        )}
      </section>
    </PanelShell>
  );
}

export default memo(FieldMapperPanel);