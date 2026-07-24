import React, { useEffect } from "react";
import { Checkbox, Form, InputNumber, Radio, Select, Space } from "antd";

import {
  formItemStyle,
  labelNodeStyle,
  timeoutUnitOptions,
} from "../constants";
import StepNumberInput from "./StepNumberInput";

interface Props {
  value?: any;
  onChange?: (patch: Record<string, any>) => void;
}

const ScheduleStrategySection: React.FC<Props> = ({ value, onChange }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      instanceGenerateMode: value?.instanceGenerateMode,
      scheduleRunType: value?.scheduleRunType,
      timeoutMode: value?.timeoutMode,
      timeoutValue: value?.timeoutValue,
      timeoutUnit: value?.timeoutUnit,
      rerunPolicy: value?.rerunPolicy,
      autoRetry: value?.autoRetry,
      retryTimes: value?.retryTimes,
      retryInterval: value?.retryInterval,
    });
  }, [value, form]);

  return (
    <div className="schedule-section-body">
      <div className="schedule-inner-panel">
        <Form
          form={form}
          layout="horizontal"
          component={false}
          labelCol={{ flex: "118px" }}
          wrapperCol={{ flex: "1" }}
          labelAlign="left"
          onValuesChange={(_, allValues) => {
            onChange?.({
              instanceGenerateMode: allValues.instanceGenerateMode,
              scheduleRunType: allValues.scheduleRunType,
              timeoutMode: allValues.timeoutMode,
              timeoutValue: allValues.timeoutValue,
              timeoutUnit: allValues.timeoutUnit,
              rerunPolicy: allValues.rerunPolicy,
              autoRetry: allValues.autoRetry,
              retryTimes: allValues.retryTimes,
              retryInterval: allValues.retryInterval,
            });
          }}
        >
          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>实例生成方式</span>}
            required
            name="instanceGenerateMode"
          >
            <Radio.Group>
              <Space size={16} wrap>
                <Radio value="nextDay">T+1次日生成</Radio>
                <Radio value="immediately">发布后即时生成</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>调度类型</span>}
            required
            name="scheduleRunType"
          >
            <Radio.Group>
              <Space size={16} wrap>
                <Radio value="normal">正常调度</Radio>
                <Radio value="pause">暂停调度</Radio>
                <Radio value="empty">空跑调度</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>超时定义</span>}
            required
          >
            <Space size={12} wrap align="center">
              <Form.Item name="timeoutMode" noStyle>
                <Radio.Group>
                  <Space size={16} wrap>
                    <Radio value="system">系统默认</Radio>
                    <Radio value="custom">自定义</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.timeoutMode !== cur.timeoutMode
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("timeoutMode") === "custom" ? (
                    <Space size={8} align="center">
                      <Form.Item name="timeoutValue" noStyle>
                        <InputNumber
                          min={1}
                          precision={0}
                          controls
                          size="small"
                          style={{ width: 72 }}
                        />
                      </Form.Item>

                      <Form.Item name="timeoutUnit" noStyle>
                        <Select
                          options={timeoutUnitOptions}
                          style={{ width: 88 }}
                          size="small"
                        />
                      </Form.Item>
                    </Space>
                  ) : null
                }
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>重跑属性</span>}
            required
            name="rerunPolicy"
          >
            <Select
              size="small"
              className="w-[380px] max-w-full"
              options={[
                {
                  label: "运行成功或失败后皆可重跑",
                  value: "success_or_fail",
                },
                {
                  label: "仅运行失败后可重跑",
                  value: "fail_only",
                },
                {
                  label: "禁止重跑",
                  value: "disabled",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>失败自动重跑</span>}
            name="autoRetry"
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.autoRetry !== cur.autoRetry}
          >
            {({ getFieldValue }) =>
              getFieldValue("autoRetry") ? (
                <>
                  <Form.Item
                    style={formItemStyle}
                    label={<span style={labelNodeStyle}>重跑次数</span>}
                  >
                    <Space size={8} align="center">
                      <Form.Item name="retryTimes" noStyle>
                        <StepNumberInput min={1} width={48} />
                      </Form.Item>
                      <span style={{ color: "#000000", fontSize: 12 }}>次</span>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    style={formItemStyle}
                    label={<span style={labelNodeStyle}>重跑间隔</span>}
                  >
                    <Space size={8} align="center">
                      <Form.Item name="retryInterval" noStyle>
                        <StepNumberInput min={1} width={48} />
                      </Form.Item>
                      <span style={{ color: "#000000", fontSize: 12 }}>
                        分钟
                      </span>
                    </Space>
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ScheduleStrategySection;