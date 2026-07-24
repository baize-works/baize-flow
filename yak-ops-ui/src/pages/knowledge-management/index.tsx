import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, message, Modal } from "antd";

import PageHeader from "./components/PageHeader";
import SideNav from "./components/SideNav";
import ContentHeader from "./components/ContentHeader";
import ParamTable from "./components/ParamTable";
import ParamModal from "./components/ParamModal";

import { CARD_BG, BORDER_COLOR, PAGE_BG } from "./constants/ui";

import {
  ConnectorParamItem,
  ConnectorParamVO,
  FormValues,
  MenuKey,
  ParamItem,
  TimeParamItem,
  TimeVariableVO,
} from "./types";
import {
  createConnectorParam,
  createTimeVariable,
  deleteConnectorParam,
  deleteTimeVariable,
  fetchConnectorParamPage,
  fetchTimeVariablePage,
  updateConnectorParam,
  updateTimeVariable,
} from "./api";

const { confirm } = Modal;

const Index: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("connector");
  const [keyword, setKeyword] = useState("");

  const [connectorLoading, setConnectorLoading] = useState(false);
  const [connectorData, setConnectorData] = useState<ConnectorParamItem[]>([]);
  const [connectorPageNum, setConnectorPageNum] = useState(1);
  const [connectorPageSize, setConnectorPageSize] = useState(10);
  const [connectorTotal, setConnectorTotal] = useState(0);

  const [timeLoading, setTimeLoading] = useState(false);
  const [timeData, setTimeData] = useState<TimeParamItem[]>([]);
  const [timePageNum, setTimePageNum] = useState(1);
  const [timePageSize, setTimePageSize] = useState(10);
  const [timeTotal, setTimeTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ParamItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm<FormValues>();

  const currentList = useMemo<ParamItem[]>(() => {
    return activeMenu === "connector" ? connectorData : timeData;
  }, [activeMenu, connectorData, timeData]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleResetSelection = () => {
    setKeyword("");
    setConnectorPageNum(1);
    setTimePageNum(1);
  };

  const mapConnectorVOToItem = useCallback(
    (record: ConnectorParamVO): ConnectorParamItem => ({
      id: record.id,
      type: "connector",
      connectorName: record.connectorName,
      connectorType: record.connectorType,
      paramName: record.paramName,
      paramDesc: record.paramDesc,
      paramType: record.paramType,
      required: record.requiredFlag === 1,
      defaultValue: record.defaultValue || "",
      exampleValue: record.exampleValue || "",
      paramContext: record.paramContext || "",
    }),
    []
  );

  const mapTimeVOToItem = useCallback(
    (record: TimeVariableVO): TimeParamItem => ({
      id: record.id,
      type: "time",
      paramName: record.paramName,
      paramDesc: record.paramDesc,
      variableSource: record.variableSource || "CUSTOM",
      valueType: record.valueType || "DYNAMIC",
      timeFormat: record.timeFormat || "yyyy-MM-dd HH:mm:ss",
      defaultValue: record.defaultValue || "",
      exampleValue: record.exampleValue || "",
      expression: record.expression || "",
      enabled: record.enabled,
      remark: record.remark || "",
    }),
    []
  );

  const loadConnectorData = useCallback(async () => {
    setConnectorLoading(true);
    try {
      const res = await fetchConnectorParamPage({
        type: "connector",
        paramName: keyword || undefined,
        pageNo: connectorPageNum,
        pageSize: connectorPageSize,
      });

      const records = Array.isArray(res?.data?.bizData)
        ? res.data.bizData.map(mapConnectorVOToItem)
        : [];

      setConnectorData(records);
      setConnectorTotal(res?.data?.pagination?.total || 0);
    } catch (error) {
     
    } finally {
      setConnectorLoading(false);
    }
  }, [connectorPageNum, connectorPageSize, keyword, mapConnectorVOToItem]);

  const loadTimeData = useCallback(async () => {
    setTimeLoading(true);
    try {
      const res = await fetchTimeVariablePage({
        keyword: keyword || undefined,
        pageNo: timePageNum,
        pageSize: timePageSize,
      });

      /**
       * 兼容两种分页结构：
       * 1. MyBatis-Plus IPage: data.records / data.total
       * 2. 你现有封装: data.bizData / data.pagination.total
       */
      const pageData = res?.data;
      const rawRecords = Array.isArray(pageData?.records)
        ? pageData.records
        : Array.isArray(pageData?.bizData)
          ? pageData.bizData
          : [];

      const total = pageData?.total ?? pageData?.pagination?.total ?? 0;

      setTimeData(rawRecords.map(mapTimeVOToItem));
      setTimeTotal(total);
    } catch (error) {
      
    } finally {
      setTimeLoading(false);
    }
  }, [keyword, timePageNum, timePageSize, mapTimeVOToItem]);

  useEffect(() => {
    if (activeMenu !== "connector") return;
    loadConnectorData();
  }, [activeMenu, loadConnectorData]);

  useEffect(() => {
    if (activeMenu !== "time") return;
    loadTimeData();
  }, [activeMenu, loadTimeData]);

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();

    if (activeMenu === "connector") {
      form.setFieldsValue({
        required: false,
        paramType: "string",
        paramContext: "",
      });
    } else {
      form.setFieldsValue({
        variableSource: "CUSTOM",
        valueType: "DYNAMIC",
        timeFormat: "yyyy-MM-dd HH:mm:ss",
        enabled: true,
      });
    }

    setModalOpen(true);
  };

  const openEditModal = (record: ParamItem) => {
    setEditingRecord(record);

    if (record.type === "connector") {
      form.setFieldsValue({
        connectorName: record.connectorName,
        connectorType: record.connectorType,
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        paramType: record.paramType,
        required: record.required,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
        paramContext: record.paramContext || "",
      });
    } else {
      form.setFieldsValue({
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        variableSource: record.variableSource,
        valueType: record.valueType,
        timeFormat: record.timeFormat,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
        expression: record.expression,
        enabled: record.enabled,
        remark: record.remark,
      });
    }

    setModalOpen(true);
  };

  const handleDelete = (record: ParamItem) => {
    const isSystemTimeVariable =
      record.type === "time" && record.variableSource === "SYSTEM";

    if (isSystemTimeVariable) {
      message.warning("系统内置变量不允许删除");
      return;
    }

    confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定删除「${record.paramName}」吗？`,
      okText: "确定",
      cancelText: "取消",
      async onOk() {
        if (record.type === "connector") {
          try {
            await deleteConnectorParam(record.id);
            message.success("删除成功");

            if (
              connectorData.length === 1 &&
              connectorPageNum > 1 &&
              connectorTotal > 1
            ) {
              setConnectorPageNum((prev) => prev - 1);
            } else {
              loadConnectorData();
            }
          } catch (error) {
            
          }
          return;
        }

        try {
          await deleteTimeVariable(record.id);
          message.success("删除成功");

          if (timeData.length === 1 && timePageNum > 1 && timeTotal > 1) {
            setTimePageNum((prev) => prev - 1);
          } else {
            loadTimeData();
          }
        } catch (error) {
          
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (activeMenu === "connector") {
        const payload = {
          id: editingRecord?.id,
          type: "connector",
          connectorName: values.connectorName || "",
          connectorType: values.connectorType || "",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          paramType: values.paramType || "string",
          requiredFlag: values.required ? 1 : 0,
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
          paramContext: values.paramContext || "",
        };

        const isEdit = Boolean(editingRecord?.id);

        if (isEdit) {
          await updateConnectorParam(payload);
        } else {
          await createConnectorParam(payload);
        }

        message.success(isEdit ? "编辑成功" : "新增成功");
        resetModal();
        loadConnectorData();
        return;
      }

      const isEdit = Boolean(editingRecord?.id);

      const timePayload = {
        id: editingRecord?.id,
        paramName: values.paramName,
        paramDesc: values.paramDesc,
        variableSource: values.variableSource || "CUSTOM",
        valueType: values.valueType || "DYNAMIC",
        timeFormat: values.timeFormat || "yyyy-MM-dd HH:mm:ss",
        defaultValue: values.defaultValue || "",
        exampleValue: values.exampleValue || "",
        expression: values.expression || "",
        enabled: values.enabled ?? true,
        remark: values.remark || "",
      };

      if (isEdit) {
        await updateTimeVariable(timePayload);
      } else {
        await createTimeVariable(timePayload);
      }

      message.success(isEdit ? "编辑成功" : "新增成功");
      resetModal();
      loadTimeData();
    } catch (error) {
      // validateFields 失败时不提示
    } finally {
      setSubmitting(false);
    }
  };

  const tablePagination =
    activeMenu === "connector"
      ? {
          current: connectorPageNum,
          pageSize: connectorPageSize,
          total: connectorTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
          onChange: (page: number, pageSize: number) => {
            const pageSizeChanged = pageSize !== connectorPageSize;
            setConnectorPageNum(pageSizeChanged ? 1 : page);
            setConnectorPageSize(pageSize);
          },
        }
      : {
          current: timePageNum,
          pageSize: timePageSize,
          total: timeTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
          onChange: (page: number, pageSize: number) => {
            const pageSizeChanged = pageSize !== timePageSize;
            setTimePageNum(pageSizeChanged ? 1 : page);
            setTimePageSize(pageSize);
          },
        };

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        background: PAGE_BG,
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          padding: "24px 24px 20px",
          boxSizing: "border-box",
        }}
      >
        <PageHeader />

        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              minHeight: "calc(100vh - 170px)",
            }}
          >
            <SideNav
              activeMenu={activeMenu}
              onChange={(key) => {
                setActiveMenu(key);
                setKeyword("");
                setConnectorPageNum(1);
                setTimePageNum(1);
              }}
              onResetSelection={handleResetSelection}
            />

            <div
              style={{
                padding: 24,
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <ContentHeader
                activeMenu={activeMenu}
                count={activeMenu === "connector" ? connectorTotal : timeTotal}
                keyword={keyword}
                onKeywordChange={(value) => {
                  setKeyword(value);

                  if (activeMenu === "connector") {
                    setConnectorPageNum(1);
                  } else {
                    setTimePageNum(1);
                  }
                }}
                onAdd={openAddModal}
              />

              <ParamTable
                activeMenu={activeMenu}
                dataSource={currentList}
                loading={activeMenu === "connector" ? connectorLoading : timeLoading}
                pagination={tablePagination}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      <ParamModal
        activeMenu={activeMenu}
        open={modalOpen}
        editingRecord={editingRecord}
        submitting={submitting}
        form={form}
        onCancel={resetModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;