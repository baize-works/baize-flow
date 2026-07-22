import { AppstoreAddOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { MenuItemConfig, MenuKey } from "../types";

export const PAGE_BG = "#ffffff";
export const CARD_BG = "#ffffff";
export const BORDER_COLOR = "#e7eaf3";
export const TEXT_SECONDARY = "#667085";
export const BLUE = "#4b5fd1";
export const BLUE_LIGHT = "#eef2ff";

export const menuList: MenuItemConfig[] = [
  {
    key: "connector",
    label: "连接器参数",
    desc: "维护参数名称、类型与使用规则",
    icon: <AppstoreAddOutlined />,
  },
  {
    key: "time",
    label: "时间变量",
    desc: "维护时间变量与替换表达式规则",
    icon: <ClockCircleOutlined />,
  },
];

export const pageTitleMap: Record<MenuKey, string> = {
  connector: "Connector 参数知识",
  time: "时间变量知识",
};

export const infoTextMap: Record<MenuKey, string> = {
  connector:
    "例如：Jdbc / parallelism / 任务并行度 / number / 非必填 / 默认值 1",
  time: "例如：start_time / 开始时间 / yyyy-MM-dd HH:mm:ss / 默认值 ${now-1d}",
};