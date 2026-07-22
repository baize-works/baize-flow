import {
  CheckSquareOutlined,
  CloseOutlined,
  DownOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from "antd";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import DatabaseIcons from "../../../../data-source/icon/DatabaseIcons";

interface AdvancedSearchFormProps {
  onSearch: (values: any) => void;
  onReset: () => void;
  initialValues?: any;
}

const { RangePicker } = DatePicker;

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  onReset,
  initialValues,
}) => {
  const intl = useIntl();
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
          {intl.formatMessage({
            id: "pages.job.status.running",
            defaultMessage: "RUNNING",
          })}
        </span>
      ),
      value: "RUNNING",
    },
    {
      label: (
        <span className="inline-flex items-center gap-2">
          <CheckSquareOutlined className="text-emerald-500" />
          {intl.formatMessage({
            id: "pages.job.status.completed",
            defaultMessage: "COMPLETED",
          })}
        </span>
      ),
      value: "COMPLETED",
    },
    {
      label: (
        <span className="inline-flex items-center gap-2">
          <CloseOutlined className="text-rose-500" />
          {intl.formatMessage({
            id: "pages.job.status.failed",
            defaultMessage: "FAILED",
          })}
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

  const selectPlaceholder = intl.formatMessage({
    id: "pages.job.search.selectPlaceholder",
    defaultMessage: "Select...",
  });

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
              label={fieldLabel(
                intl.formatMessage({
                  id: "pages.job.search.jobName",
                  defaultMessage: "Job Name",
                }),
              )}
            >
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder={intl.formatMessage({
                  id: "pages.job.search.jobName.placeholder",
                  defaultMessage: "Enter job name",
                })}
                className="h-8"
                style={{ borderRadius: 16 }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={7}>
            <Form.Item
              {...commonFormItemProps}
              name="createTime"
              label={fieldLabel(
                intl.formatMessage({
                  id: "pages.job.search.createTime",
                  defaultMessage: "Create Time",
                }),
              )}
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
              label={fieldLabel(
                intl.formatMessage({
                  id: "pages.job.search.status",
                  defaultMessage: "Status",
                }),
              )}
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
                  {intl.formatMessage({
                    id: "pages.job.search.button.search",
                    defaultMessage: "Search",
                  })}
                </Button>

                <Button
                  onClick={handleReset}
                  className="h-8 rounded-full border-slate-200 px-5 text-slate-600 hover:!border-slate-300 hover:!text-slate-900"
                >
                  {intl.formatMessage({
                    id: "pages.job.search.button.reset",
                    defaultMessage: "Reset",
                  })}
                </Button>

                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                  onClick={() => setExpand((prev) => !prev)}
                >
                  {expand
                    ? intl.formatMessage({
                        id: "pages.job.search.collapse",
                        defaultMessage: "Collapse",
                      })
                    : intl.formatMessage({
                        id: "pages.job.search.expand",
                        defaultMessage: "Expand",
                      })}

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
                label={fieldLabel(
                  intl.formatMessage({
                    id: "pages.job.search.jobId",
                    defaultMessage: "Job Definition ID",
                  }),
                )}
              >
                <Input
                  allowClear
                  placeholder={intl.formatMessage({
                    id: "pages.job.search.jobId.placeholder",
                    defaultMessage: "Enter job definition ID",
                  })}
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="sourceType"
                label={fieldLabel(
                  intl.formatMessage({
                    id: "pages.job.search.source",
                    defaultMessage: "Source",
                  }),
                )}
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
                label={fieldLabel(
                  intl.formatMessage({
                    id: "pages.job.search.sink",
                    defaultMessage: "Sink",
                  }),
                )}
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
                label={fieldLabel(
                  intl.formatMessage({
                    id: "pages.job.search.sourceTable",
                    defaultMessage: "Source Table",
                  }),
                )}
              >
                <Input
                  allowClear
                  placeholder={intl.formatMessage({
                    id: "pages.job.search.fuzzyPlaceholder",
                    defaultMessage: "Fuzzy match...",
                  })}
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="sinkTable"
                label={fieldLabel(
                  intl.formatMessage({
                    id: "pages.job.search.sinkTable",
                    defaultMessage: "Sink Table",
                  }),
                )}
              >
                <Input
                  allowClear
                  placeholder={intl.formatMessage({
                    id: "pages.job.search.fuzzyPlaceholder",
                    defaultMessage: "Fuzzy match...",
                  })}
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

export default AdvancedSearchForm;
