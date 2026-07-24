import Header from "@/components/Header";
import { useIntl } from "@umijs/max";
import { Form, Input, Radio } from "antd";
import TextArea from "antd/es/input/TextArea";

const BasicConfig = () => {
  const intl = useIntl();

  return (
    <>
      <Header
        title={
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            {intl.formatMessage({
              id: "pages.job.config.basicSetting",
              defaultMessage: "Basic Setting",
            })}
          </span>
        }
      />

      <Form.Item
        label={intl.formatMessage({
          id: "pages.job.config.jobName",
          defaultMessage: "Job Name",
        })}
        name="jobName"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "pages.job.config.jobName.required",
              defaultMessage: "Job name cannot be empty",
            }),
          },
        ]}
      >
        <Input size="small" />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "pages.job.config.jobDesc",
          defaultMessage: "Job Description",
        })}
        name="jobDesc"
      >
        <TextArea rows={4} size="small" />
      </Form.Item>

      <Form.Item
        label="同步模式"
        name="syncMode"
        rules={[{ required: true, message: "请选择同步模式" }]}
      >
        <Radio.Group size="small">
          <Radio value="DAG">单表模式</Radio>
          <Radio value="WHOLE_SYNC">多表模式</Radio>
        </Radio.Group>
      </Form.Item>
    </>
  );
};

export default BasicConfig;
