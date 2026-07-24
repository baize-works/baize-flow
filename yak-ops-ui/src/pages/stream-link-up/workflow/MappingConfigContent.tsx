import styles from "./index.less";

const formItems = ["字段映射规则", "主键策略", "类型转换", "异常处理"];

export default function MappingConfigContent() {
  return (
    <div className={styles.formGrid}>
      {formItems.map((item) => (
        <div key={item} className={styles.formCard}>
          <div className={styles.formCardTitle}>{item}</div>
          <div className={styles.formPlaceholder} />
        </div>
      ))}
    </div>
  );
}