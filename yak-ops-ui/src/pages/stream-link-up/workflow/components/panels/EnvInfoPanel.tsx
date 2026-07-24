import { Form, Input, Select } from "antd";
import styles from "../index.less";

export default function EnvInfoPanel({ form }: { params: any; form: any }) {
  return (
    <div className={styles.panelSection}>
      <div className={styles.sectionTitle}>Env 信息</div>

      <Form form={form} layout="vertical">
        <Form.Item label="运行环境" name="runtimeEnv">
          <Select
            placeholder="请选择环境"
            options={[
              { label: "开发环境", value: "DEV" },
              { label: "测试环境", value: "TEST" },
              { label: "生产环境", value: "PROD" },
            ]}
          />
        </Form.Item>

        <Form.Item label="资源组 / 队列" name="resourceGroup">
          <Input placeholder="请输入资源组名称" />
        </Form.Item>

        <Form.Item label="环境变量" name="envRemark">
          <Input.TextArea rows={5} placeholder="这里后续可扩展成 key/value 结构" />
        </Form.Item>
      </Form>
    </div>
  );
}