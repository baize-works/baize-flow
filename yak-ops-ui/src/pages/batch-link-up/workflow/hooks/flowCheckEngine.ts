export type CheckLevel = "error" | "warning";

export interface CheckItem {
  nodeId: string;
  nodeType: string;
  level: CheckLevel;
  message: string;
  title?: string;
  dbType?: string;
  componentType?: string;
  field?: string;
}

export interface NodeCheckGroup {
  nodeId: string;
  nodeType: string;
  title?: string;
  dbType?: string;
  items: CheckItem[];
  componentType?: string;
}

export type NodeCheckRule = (node: any) => CheckItem | null;

const getNodeMeta = (node: any) => ({
  nodeId: node?.id,
  nodeType: node?.data?.nodeType || "",
  componentType: node?.data?.componentType || "",
  title: node?.data?.title,
  dbType: node?.data?.dbType,
});

const getConfig = (node: any) => node?.data?.config || {};

const buildWarning = (node: any, field: string, message: string): CheckItem => ({
  ...getNodeMeta(node),
  level: "warning",
  field,
  message,
});

export const groupCheckListByNode = (
  list: CheckItem[]
): NodeCheckGroup[] => {
  const map = new Map<string, NodeCheckGroup>();

  list.forEach((item) => {
    const key = item.nodeId;
    if (!map.has(key)) {
      map.set(key, {
        nodeId: item.nodeId,
        nodeType: item.nodeType,
        componentType: item.componentType,
        title: item.title,
        dbType: item.dbType,
        items: [],
      });
    }
    map.get(key)!.items.push(item);
  });

  return Array.from(map.values());
};

const sourceRules: NodeCheckRule[] = [
  (node) => {
    const config = getConfig(node);
    if (!config.dataSourceId) {
      return buildWarning(node, "dataSourceId", "缺少源端数据源配置");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (!config.readMode) {
      return buildWarning(node, "readMode", "请选择读取方式");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (config.readMode === "table" && !config.table) {
      return buildWarning(node, "table", "按表读取时必须选择源表");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (config.readMode === "sql" && !String(config.sql || "").trim()) {
      return buildWarning(node, "sql", "自定义 SQL 不能为空");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (!config.pluginOutput) {
      return buildWarning(node, "pluginOutput", "缺少 source 输出标识");
    }
    return null;
  },
];

const transformRules: NodeCheckRule[] = [
  (node) => {
    const config = getConfig(node);

    if (!config.pluginInput) {
      return buildWarning(
        node,
        "pluginInput",
        "缺少上游输入配置"
      );
    }

    return null;
  },

  (node) => {
    const config = getConfig(node);

    if (!config.pluginOutput) {
      return buildWarning(
        node,
        "pluginOutput",
        "缺少下游输出配置"
      );
    }

    return null;
  },

  (node) => {
    const componentType =
      node?.data?.componentType;

    const config = getConfig(node);

    if (
      componentType === "SQL" &&
      !String(config.sql || "").trim()
    ) {
      return buildWarning(
        node,
        "sql",
        "SQL 转换脚本不能为空"
      );
    }

    return null;
  },
];

const sinkRules: NodeCheckRule[] = [
  (node) => {
    const config = getConfig(node);
    if (!config.dataSourceId) {
      return buildWarning(node, "dataSourceId", "缺少目标数据源配置");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (!config.writeMode) {
      return buildWarning(node, "writeMode", "请选择写入模式");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (config.autoCreateTable) {
      if (!String(config.targetTableName || "").trim()) {
        return buildWarning(node, "targetTableName", "自动建表时必须填写目标表名");
      }
      return null;
    }

    if (!config.targetMode) {
      return buildWarning(node, "targetMode", "请选择目标写入方式");
    }

    if (config.targetMode === "table" && !config.table) {
      return buildWarning(node, "table", "按表写入时必须选择目标表");
    }

    if (config.targetMode === "sql" && !String(config.sql || "").trim()) {
      return buildWarning(node, "sql", "自定义写入 SQL 不能为空");
    }

    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (config.writeMode === "upsert" && !String(config.primaryKey || "").trim()) {
      return buildWarning(node, "primaryKey", "Upsert 模式下必须填写主键字段");
    }
    return null;
  },
  (node) => {
    const config = getConfig(node);
    if (!config.pluginInput) {
      return buildWarning(node, "pluginInput", "缺少 sink 输入标识");
    }
    return null;
  },
];

export const nodeRuleMap: Record<string, NodeCheckRule[]> = {
  source: sourceRules,
  transform: transformRules,
  sink: sinkRules,
};

export const generateCheckList = (nodes: any[]): CheckItem[] => {
  const result: CheckItem[] = [];

  nodes.forEach((node) => {
    const nodeType = node?.data?.nodeType;
    const rules = nodeRuleMap[nodeType];
    if (!rules) return;

    rules.forEach((rule) => {
      try {
        const r = rule(node);
        if (r) result.push(r);
      } catch (error) {
        result.push({
          ...getNodeMeta(node),
          level: "error",
          message: "节点校验执行异常",
        });
      }
    });
  });

  return result;
};

export const classifyCheckResult = (list: CheckItem[]) => ({
  errors: list.filter((i) => i.level === "error"),
  warnings: list.filter((i) => i.level === "warning"),
  total: list.length,
});