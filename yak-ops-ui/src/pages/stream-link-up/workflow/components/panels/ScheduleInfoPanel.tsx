import { Form, Input, Select, Switch } from "antd";
import styles from "../index.less";

export default function ScheduleInfoPanel({ form }: { params: any; form: any }) {
  return (
    <div className={styles.panelSection}>
      <div className={styles.sectionTitle}>调度信息</div>

      <Form form={form} layout="vertical">
        <Form.Item label="是否开启调度" name="scheduleEnabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="调度周期" name="scheduleCycle">
          <Select
            placeholder="请选择调度周期"
            options={[
              { label: "手动执行", value: "MANUAL" },
              { label: "按天", value: "DAILY" },
              { label: "按小时", value: "HOURLY" },
              { label: "Cron 表达式", value: "CRON" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Cron 表达式" name="cronExpr">
          <Input placeholder="例如 0 0 * * *" />
        </Form.Item>
      </Form>
    </div>
  );
}