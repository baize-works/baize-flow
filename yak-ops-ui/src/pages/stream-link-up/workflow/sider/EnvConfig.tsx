import Header from "@/components/Header";
import { Form, Input } from "antd";
import { useIntl } from "@umijs/max";

function EnvConfig() {
  const intl = useIntl();

  return (
    <>
      <Header
        title={
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            {intl.formatMessage({
              id: "pages.job.config.envSetting",
              defaultMessage: "Env Setting",
            })}
          </span>
        }
      />

      <Form.Item
        label={intl.formatMessage({
          id: "pages.job.config.parallelism",
          defaultMessage: "Parallelism",
        })}
        name="parallelism"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "pages.job.config.parallelism.required",
              defaultMessage: "Parallelism cannot be empty",
            }),
          },
        ]}
      >
        <Input size="small" />
      </Form.Item>
    </>
  );
}

export default EnvConfig;