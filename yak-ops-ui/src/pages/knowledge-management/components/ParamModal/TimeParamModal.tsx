import { ClockCircleOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Switch,
  message,
} from "antd";
import React, { useMemo, useState } from "react";
import { previewTimeVariable } from "../../api";
import { timeFormatOptions } from "../../constants/options";
import { TEXT_SECONDARY } from "../../constants/ui";
import { FormValues, MenuKey, ParamItem, TimeParamItem } from "../../types";

const { TextArea } = Input;

interface Props {
  activeMenu: MenuKey;
  open: boolean;
  editingRecord: ParamItem | null;
  submitting: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const TimeParamModal: React.FC<Props> = ({
  open,
  editingRecord,
  submitting,
  form,
  onCancel,
  onSubmit,
}) => {
  const isEdit = !!editingRecord;
  const timeRecord =
    editingRecord?.type === "time" ? (editingRecord as TimeParamItem) : null;
  const isSystem = timeRecord?.variableSource === "SYSTEM";

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewValue, setPreviewValue] = useState<string>("");

  const valueType = Form.useWatch("valueType", form);

  const modalTitle = useMemo(() => {
    if (isSystem) return "查看时间变量";
    return isEdit ? "编辑时间变量" : "新增时间变量";
  }, [isEdit, isSystem]);

  const handlePreview = async () => {
    try {
      const values = await form.validateFields(["expression", "timeFormat"]);

      if (!values.expression) {
        message.warning("请先填写动态表达式");
        return;
      }

      setPreviewLoading(true);

      const res = await previewTimeVariable({
        expression: values.expression,
        timeFormat: values.timeFormat || "yyyy-MM-dd HH:mm:ss",
      });

      setPreviewValue(res?.data?.value || "");
    } catch (error) {
      // 表单校验失败时不额外提示
    } finally {
      setPreviewLoading(false);
    }
  };

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
      okButtonProps={{
        disabled: isSystem,
      }}
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
            <ClockCircleOutlined />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-semibold leading-7 text-[#101828]">
              {modalTitle}
            </div>

            <div className="mt-[2px] text-[13px] leading-5 text-[#667085]">
              维护 HOCON 中可替换的时间变量、输出格式与动态表达式
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
            保存前建议先预览一次结果，确认变量会按预期替换到任务配置中
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
      <Form<FormValues> form={form} layout="vertical" disabled={isSystem}>
        <div className="flex flex-col gap-4">
          {isSystem && (
            <Alert
              type="info"
              showIcon
              message="系统内置变量仅支持查看"
              description="这类变量用于覆盖常见同步场景，不建议直接修改。需要定制时，可以新增一个自定义时间变量。"
            />
          )}

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              基础信息
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先定义时间变量名称与用途，保证含义清晰、易于复用
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="参数名称"
                name="paramName"
                rules={[
                  { required: true, message: "请输入参数名称" },
                  {
                    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                    message: "仅支持字母、数字、下划线，且必须以字母开头",
                  },
                ]}
              >
                <Input placeholder="如 start_time / end_time / biz_date" />
              </Form.Item>

              <Form.Item
                label="变量来源"
                name="variableSource"
                rules={[{ required: true, message: "请选择变量来源" }]}
              >
                <Select
                  options={[
                    { label: "自定义", value: "CUSTOM" },
                    { label: "系统内置", value: "SYSTEM" },
                  ]}
                  disabled
                />
              </Form.Item>
            </div>

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
                placeholder="请输入时间变量的用途说明"
              />
            </Form.Item>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              格式与取值
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先确定变量的取值方式，再配置固定值或动态表达式
            </div>

            <Form.Item
              label="取值方式"
              name="valueType"
              rules={[{ required: true, message: "请选择取值方式" }]}
            >
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: "动态表达式", value: "DYNAMIC" },
                  { label: "固定值", value: "FIXED" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="时间格式"
              name="timeFormat"
              rules={[{ required: true, message: "请选择时间格式" }]}
            >
              <Select
                placeholder="请选择时间格式"
                options={timeFormatOptions}
              />
            </Form.Item>

            {valueType === "FIXED" ? (
              <Form.Item
                label="默认值"
                name="defaultValue"
                rules={[{ required: true, message: "请输入固定值" }]}
              >
                <Input placeholder="如 2026-05-01 00:00:00" />
              </Form.Item>
            ) : (
              <Form.Item
                label="动态表达式"
                name="expression"
                rules={[{ required: true, message: "请输入动态表达式" }]}
                tooltip="例如 schedule_time-1d@day_start，表示基于调度时间减 1 天并取当天 0 点"
              >
                <Input placeholder="如 schedule_time-1d@day_start" />
              </Form.Item>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="示例值"
                name="exampleValue"
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="如 2026-05-01 00:00:00" />
              </Form.Item>

              <Form.Item
                label="启用状态"
                name="enabled"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </div>
          </div>

          {valueType === "DYNAMIC" && (
            <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
                表达式预览
              </h3>
              <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
                使用当前时间作为基准时间，快速检查表达式是否符合预期
              </div>

              <div className="flex items-center gap-3">
                <Button loading={previewLoading} onClick={handlePreview}>
                  预览结果
                </Button>

                {previewValue ? (
                  <div className="rounded-lg border border-[#D0D5DD] bg-[#F8FAFC] px-3 py-1.5 text-[13px] text-[#101828]">
                    {previewValue}
                  </div>
                ) : (
                  <div className="text-[13px] text-[#98A2B3]">暂无预览结果</div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              备注
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              可补充变量适用场景，方便后续维护
            </div>

            <Form.Item label="备注" name="remark" style={{ marginBottom: 0 }}>
              <TextArea
                rows={3}
                showCount
                maxLength={300}
                placeholder="如用于离线任务按天同步的开始时间"
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TimeParamModal;
