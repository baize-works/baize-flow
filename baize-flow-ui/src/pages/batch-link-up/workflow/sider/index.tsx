import { Divider, Form, Layout } from "antd";
import { useEffect, useState } from "react";
import BasicConfig from "./BasicConfig";
import EmojiPicker from "./emoji-picker";
import EnvConfig from "./EnvConfig";
import styles from "./index.less";
import ScheduleConfig from "./ScheduleConfig";
import TaskHeader from "./TaskHeader";
const { Sider } = Layout;
export default function LeftSider({ params, form }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [appIcon, setAppIcon] = useState({
    type: "emoji",
    icon: "robot_face",
    background: "rgb(255, 234, 213)",
  });

  useEffect(() => {
    if (params) {
      form.setFieldsValue({
        cronExpression: "0 0 1 * * ?",
      });
    }
  }, [params, form]);

  useEffect(() => {
    if (params?.id) {
      form.setFieldsValue({
        ...params,
      });
    }
  }, [params]);

  return (
    <>
    123
      {/* <Sider
        width={280}
        className={styles.sider}
        style={{
          cursor: "default",
          overflowY: "auto",
          height: "calc(100vh - 56px)",
        }}
      >
        <TaskHeader />

        <Divider style={{ margin: "8px 0", padding: 0 }} />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            clientId: 1,
            jobDesc: "Batch Sync",
            scheduleStatus: "PAUSED",
            syncMode: "DAG",
            parallelism: 1,
            jobName: `${params?.sourceType?.dbType?.toLowerCase()}2${params?.targetType?.dbType?.toLowerCase()}`,
          }}
        >
          <BasicConfig />
          <ScheduleConfig form={form} />
          <EnvConfig />
        </Form>
      </Sider>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={(icon) => {
            setAppIcon(icon);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )} */}
    </>
  );
}
