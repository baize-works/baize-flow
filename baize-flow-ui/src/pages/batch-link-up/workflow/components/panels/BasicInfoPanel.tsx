import { Form, Input } from "antd";
import styles from "../index.less";

export default function BasicInfoPanel({ params, form }: { params: any; form: any }) {
  return (
    <div className={styles.panelSection}>
      <div className={styles.sectionTitle}>基本信息</div>

      <Form form={form} layout="vertical">
        <Form.Item label="任务名称" name="jobName">
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item label="任务描述" name="jobDesc">
          <Input.TextArea rows={4} placeholder="补充一下这个任务是做什么的" />
        </Form.Item>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>来源类型</div>
          <div className={styles.infoValue}>{params?.sourceType?.dbType || "-"}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>目标类型</div>
          <div className={styles.infoValue}>{params?.targetType?.dbType || "-"}</div>
        </div>
      </Form>
    </div>
  );
}