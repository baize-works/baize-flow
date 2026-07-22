import { Settings2 } from "lucide-react";
import { useState } from "react";
import { getTabDefinitions } from "./configDefinition";
import styles from "./index.less";
import type { TabKey } from "./types";

interface RightConfigPanelProps {
  activeTab?: TabKey | null;
  onTabChange?: (tab: TabKey | null) => void;
  params?: any;
  basicConfig?: any;
  setBasicConfig?: React.Dispatch<React.SetStateAction<any>>;
  scheduleConfig?: any;
  setScheduleConfig?: React.Dispatch<React.SetStateAction<any>>;
  envConfig?: any;
  setEnvConfig?: React.Dispatch<React.SetStateAction<any>>;
}

export default function RightConfigPanel({
  activeTab = null,
  onTabChange,
  params,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
  envConfig,
  setEnvConfig,
}: RightConfigPanelProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabDefinitions = getTabDefinitions(
    params,
    basicConfig,
    setBasicConfig,
    scheduleConfig,
    setScheduleConfig,
    envConfig,
    setEnvConfig
  );

  const currentContent = activeTab
    ? tabDefinitions.find((item: any) => item.key === activeTab)?.content
    : null;

  const handleTabClick = (tab: TabKey) => {
    if (activeTab === tab) {
      onTabChange?.(null);
      return;
    }

    onTabChange?.(tab);
  };

  const opened = !!activeTab;

  return (
    <div
      className={`${styles.sidePanel} ${
        opened ? styles.sidePanelOpened : styles.sidePanelCollapsed
      }`}
    >
      <div className={styles.sidePanelContentWrap}>
        {opened && (
          <div className={styles.sidePanelMain}>
            <div className={styles.sidePanelHeader}>
              <div
                className={styles.sidePanelIconTitle}
                style={{ fontWeight: 600, fontSize: 15 }}
              >
                配置面板
              </div>
            </div>

            <div className={styles.sidePanelBody}>{currentContent}</div>
          </div>
        )}

        <div className={styles.sidePanelTabs}>
          <div className={styles.sidePanelTabsTop}>
            <div className={styles.sidePanelSettingIcon}>
              <Settings2 size={16} strokeWidth={1.9} />
            </div>
          </div>

          <div className={styles.sidePanelTabList}>
            {tabDefinitions.map((item: any) => {
              const active = activeTab === item.key;
              const hovered = hoveredTab === item.key;

              return (
                <div
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  onMouseEnter={() => setHoveredTab(item.key)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`${styles.sidePanelTab} ${
                    active ? styles.sidePanelTabActive : ""
                  } ${hovered ? styles.sidePanelTabHovered : ""}`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
