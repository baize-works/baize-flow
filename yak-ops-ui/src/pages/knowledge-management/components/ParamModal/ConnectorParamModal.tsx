import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Select, Switch } from "antd";
import React from "react";
import {
  connectorNameOptions,
  connectorTypeOptions,
} from "../../constants/options";
import { TEXT_SECONDARY } from "../../constants/ui";
import { FormValues, ParamItem } from "../../types";

const { TextArea } = Input;

interface Props {
  open: boolean;
  editingRecord: ParamItem | null;
  submitting: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const ConnectorParamModal: React.FC<Props> = ({
  open,
  editingRecord,
  submitting,
  form,
  onCancel,
  onSubmit,
}) => {
  const isEdit = !!editingRecord;

  return (
    <Modal
      width={920}
      open={open}
      centered
      maskClosable={false}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={submitting}
      destroyOnClose
      okText="保存"
      cancelText="取消"
      styles={{
        header: {
          padding: "20px 24px 16px",
          borderBottom: "1px solid #EEF2F6",
          marginBottom: 0,
        },
        body: {
          padding: "20px 24px 16px",
          background: "#F8FAFC",
          maxHeight: "72vh",
          overflowY: "auto",
        },
        footer: {
          padding: "14px 24px 18px",
          borderTop: "1px solid #EEF2F6",
          background: "#FFFFFF",
          marginTop: 0,
        },
        content: {
          borderRadius: 20,
          overflow: "hidden",
        },
      }}
      title={
        <div className="flex min-w-0 items-center gap-3 pr-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[16px] text-[#3B82F6]">
            <SettingOutlined />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-semibold leading-7 text-[#101828]">
              {isEdit ? "编辑 Connector 参数" : "新增 Connector 参数"}
            </div>

            <div className="mt-[2px] text-[13px] leading-5 text-[#667085]">
              维护 Connector 参数的名称、说明、类型、默认规则与深度语义
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div
            className="text-[13px] leading-5"
            style={{ color: TEXT_SECONDARY || "#667085" }}
          >
            建议补充默认值、示例值和参数深度语义，方便后续推荐与复用
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onCancel} style={{ borderRadius: 16 }}>
              取消
            </Button>
            <Button
              type="primary"
              loading={submitting}
              style={{ borderRadius: 16 }}
              onClick={onSubmit}
            >
              保存
            </Button>
          </div>
        </div>
      }
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          required: false,
          paramType: "string",
          paramContext: "",
        }}
      >
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            style={{ paddingBottom: 28 }}
          >
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              基础信息
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先定义参数归属、名称和用途说明，便于后续统一维护
            </div>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Connector"
                  name="connectorName"
                  rules={[{ required: true, message: "请选择 Connector" }]}
                >
                  <Select
                    placeholder="请选择 Connector"
                    options={connectorNameOptions}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="连接器类型"
                  name="connectorType"
                  rules={[{ required: true, message: "请输入连接器类型" }]}
                >
                  <Select
                    placeholder="如 source / sink"
                    options={[
                      { label: "SOURCE", value: "source" },
                      { label: "SINK", value: "sink" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="参数名称"
              name="paramName"
              rules={[{ required: true, message: "请输入参数名称" }]}
            >
              <Input placeholder="如 parallelism / query / table / fetch.size" />
            </Form.Item>
            <Form.Item
              label="参数说明"
              name="paramDesc"
              rules={[{ required: true, message: "请输入参数说明" }]}
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={4}
                showCount
                maxLength={300}
                placeholder="请输入参数用途、适用场景或填写说明"
              />
            </Form.Item>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              参数规则
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              配置参数类型、是否必填等核心规则，帮助使用者快速理解输入要求
            </div>

            <div className="flex items-start gap-4">
              <Form.Item
                label="参数类型"
                name="paramType"
                rules={[{ required: true, message: "请选择参数类型" }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select
                  placeholder="请选择参数类型"
                  options={connectorTypeOptions}
                />
              </Form.Item>

              <Form.Item
                label="是否必填"
                name="required"
                valuePropName="checked"
                style={{ width: 180, marginBottom: 0 }}
              >
                <Switch checkedChildren="必填" unCheckedChildren="非必填" />
              </Form.Item>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              默认值与示例
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              可选填写，适合沉淀通用配置，减少重复输入
            </div>

            <div className="flex gap-4">
              <Form.Item
                label="默认值"
                name="defaultValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="请输入默认值" />
              </Form.Item>

              <Form.Item
                label="示例值"
                name="exampleValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="请输入示例值" />
              </Form.Item>
            </div>
          </div>

          <div
            className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            style={{ paddingBottom: 28 }}
          >
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              参数深度语义
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              用于补充处理逻辑、影响范围、推荐依据和示例，主要供 AI 参数推荐使用
            </div>

            <Form.Item
              label="参数上下文"
              name="paramContext"
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={10}
                showCount
                maxLength={6000}
                placeholder={`建议填写 JSON 或半结构化内容，例如：
{
  "summary": "控制 JDBC 结果集读取时的单次抓取批量",
  "processingLogic": [
    "影响结果集分批拉取过程",
    "不等于 limit",
    "越大网络往返越少，但单批内存压力更高"
  ],
  "recommendationHints": [
    "大结果集可适当调大",
    "宽表或大字段场景不宜过大"
  ],
  "cautions": [
    "不是越大越好"
  ]
}`}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ConnectorParamModal;
