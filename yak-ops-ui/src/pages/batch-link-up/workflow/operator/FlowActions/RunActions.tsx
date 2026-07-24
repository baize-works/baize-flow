import { RollbackOutlined } from "@ant-design/icons";

import Run from "../../icon/Run";
import styles from "./index.less";

export const RunActions = ({ onBack, onRun, runVisible }: any) => (
  <>
    <div className={styles["run-container"]}>
      <div
        className={styles["run-button"]}
        style={{ width: 36 }}
        onClick={onBack}
      >
        <RollbackOutlined />
      </div>
    </div>
    <div className={styles["run-container"]}>
      <div
        className={styles["run-button"]}
        style={{
          width: 66,
          cursor: runVisible ? 'not-allowed' : 'pointer',
          opacity: runVisible ? 0.6 : 1,
        }}
        onClick={onRun}
      >
        <Run />
        Run
      </div>
    </div>
  </>
);
