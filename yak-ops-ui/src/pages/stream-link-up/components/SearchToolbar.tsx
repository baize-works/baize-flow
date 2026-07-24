import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import {
  CheckSquareOutlined,
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from "antd";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";


interface SearchToolbarProps {
  initialValues?: any;
  onSearch: (values: any) => void;
  onReset: () => void;
}

const { RangePicker } = DatePicker;

const SearchToolbar: React.FC<SearchToolbarProps> = ({
  initialValues,
  onSearch,
  onReset,
}) => {
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const defaultTimeRange = useMemo(
    () => [moment().subtract(4, "days"), moment().add(1, "days")],
    [],
  );

  const mergedInitialValues = useMemo(
    () => ({
      createTime: defaultTimeRange,
      ...initialValues,
    }),
    [defaultTimeRange, initialValues],
  );

  useEffect(() => {
    form.setFieldsValue(mergedInitialValues);
  }, [form, mergedInitialValues]);

  useEffect(() => {
    const hasAdvancedValue = Boolean(
      initialValues?.id ||
        initialValues?.status ||
        initialValues?.sourceType ||
        initialValues?.sinkType ||
        initialValues?.sourceTable ||
        initialValues?.sinkTable,
    );

    if (hasAdvancedValue) {
      setExpand(true);
    }
  }, [initialValues]);

  const handleFinish = (values: any) => {
    onSearch(values);
  };

  const handleReset = () => {
    const resetValues = {
      createTime: defaultTimeRange,
      jobName: undefined,
      id: undefined,
      status: undefined,
      sourceType: undefined,
      sinkType: undefined,
      sourceTable: undefined,
      sinkTable: undefined,
    };

    form.setFieldsValue(resetValues);
    onReset();
  };

  const createDataSourceOption = (dbType: string, value: string) => ({
    label: (
      <div className="flex items-center gap-2">
        <DatabaseIcons dbType={dbType} width="14" height="14" />
        <span>{dbType}</span>
      </div>
    ),
    value,
  });

  const dataSourceOption = [
    createDataSourceOption("MySql", "MYSQL"),
    createDataSourceOption("Oracle", "ORACLE"),
    createDataSourceOption("PostgreSQL", "POSTGRE_SQL"),
    createDataSourceOption("Kingbase", "KINGBASE"),
    createDataSourceOption("Dameng", "DAMENG"),
  ];

  const statusOptions = [
    {
      label: (
        <span className="inline-flex items-center gap-2">
          <SyncOutlined spin className="text-blue-500" />
          RUNNING
        </span>
      ),
      value: "RUNNING",
    },
    {
      label: (
        <span className="inline-flex items-center gap-2">
          <CheckSquareOutlined className="text-emerald-500" />
          COMPLETED
        </span>
      ),
      value: "COMPLETED",
    },
    {
      label: (
        <span className="inline-flex items-center gap-2">
          <CloseOutlined className="text-rose-500" />
          FAILED
        </span>
      ),
      value: "FAILED",
    },
  ];

  const fieldLabel = (text: React.ReactNode) => (
    <span className="text-xs font-medium text-slate-600">{text}</span>
  );

  const commonFormItemProps = {
    className: "mb-0",
    labelCol: {
      flex: "72px",
    },
    wrapperCol: {
      flex: 1,
    },
  };

  const selectPlaceholder = "请选择";

  return (
    <div className="bg-white px-5 py-4">
      <Form
        form={form}
        name="advanced_search"
        onFinish={handleFinish}
        initialValues={mergedInitialValues}
      >
        <Row gutter={[16, 14]} align="bottom">
          <Col xs={24} md={12} xl={7}>
            <Form.Item
              {...commonFormItemProps}
              name="jobName"
              label={fieldLabel("任务名称")}
            >
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="请输入任务名称"
                className="h-8"
                style={{ borderRadius: 16 }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={7}>
            <Form.Item
              {...commonFormItemProps}
              name="createTime"
              label={fieldLabel("创建时间")}
            >
              <RangePicker
                className="h-8 w-full"
                style={{ borderRadius: 16 }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={6}>
            <Form.Item
              {...commonFormItemProps}
              name="status"
              label={fieldLabel("运行状态")}
            >
              <Select
                allowClear
                showSearch
                placeholder={selectPlaceholder}
                options={statusOptions}
                className="w-full"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={4}>
            <div className="flex h-8 items-center justify-start md:justify-end">
              <Space size={8}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="h-8 rounded-full border-none px-5 font-medium shadow-none"
                >
                  搜索
                </Button>

                <Button
                  onClick={handleReset}
                  className="h-8 rounded-full border-slate-200 px-5 text-slate-600 hover:!border-slate-300 hover:!text-slate-900"
                >
                  重置
                </Button>

                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                  onClick={() => setExpand((prev) => !prev)}
                >
                  {expand ? "收起" : "展开"}

                  <DownOutlined
                    className={[
                      "text-[10px] transition-transform duration-200",
                      expand ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  />
                </button>
              </Space>
            </div>
          </Col>
        </Row>

        {expand && (
          <Row gutter={[16, 14]} className="mt-4" align="bottom">
            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="id"
                label={fieldLabel("任务定义ID")}
              >
                <Input
                  allowClear
                  placeholder="请输入任务定义ID"
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="sourceType"
                label={fieldLabel("来源类型")}
              >
                <Select
                  allowClear
                  showSearch
                  placeholder={selectPlaceholder}
                  options={dataSourceOption}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Form.Item
                {...commonFormItemProps}
                name="sinkType"
                label={fieldLabel("去向类型")}
              >
                <Select
                  allowClear
                  showSearch
                  placeholder={selectPlaceholder}
                  options={dataSourceOption}
                  className="w-full"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={4} />

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="sourceTable"
                label={fieldLabel("来源表")}
              >
                <Input
                  allowClear
                  placeholder="支持模糊匹配"
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="sinkTable"
                label={fieldLabel("去向表")}
              >
                <Input
                  allowClear
                  placeholder="支持模糊匹配"
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

export default SearchToolbar;
