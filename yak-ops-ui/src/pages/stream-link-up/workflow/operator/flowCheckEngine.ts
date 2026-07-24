export type CheckLevel = "error" | "warning";

export interface CheckItem {
    nodeId: string;
    nodeType: string;
    level: CheckLevel;
    message: string;
    title?: string;
    dbType?: string;
    field?: string;
    componentType?: string;
}

export type NodeCheckRule = (node: any) => CheckItem | null;

export interface NodeCheckGroup {
    nodeId: string;
    nodeType: string;
    title?: string;
    dbType?: string;
    items: CheckItem[];
    componentType?: string;
}

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
        if (!node.data?.sourceId) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "sourceId",
                message: "sourceId Required",
            };
        }
        return null;
    },

    (node) => {
        if (!node.data?.taskExecuteType) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "taskExecuteType",
                message: "taskExecuteType Required",
            };
        }
        return null;
    },

    (node) => {
        if (node.data?.taskExecuteType !== "SINGLE_TABLE") {
            return null;
        }
        if (!node.data?.table_path) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "table_path",
                message: "table_path Required",
            };
        }
        return null;
    },

    (node) => {
        if (node.data?.taskExecuteType !== "TABLE_CUSTOM") {
            return null;
        }
        if (!node.data?.query) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "query",
                message: "query Required",
            };
        }
        return null;
    },

];


const transformRules: NodeCheckRule[] = [
    (node) => {
        if (!node.data?.pluginInput) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "pluginInput",
                message: "pluginInput Required",
            };
        }
        return null;
    },
    (node) => {
        if (!node.data?.pluginOutput) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "pluginOutput",
                message: "pluginOutput Required",
            };
        }
        return null;
    },

];



const sinkRules: NodeCheckRule[] = [
    (node) => {
        if (!node.data?.sinkId) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "sinkId",
                message: "sinkId Required",
            };
        }
        return null;
    },
    (node) => {
        if (!node.data?.taskExecuteType) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "taskExecuteType",
                message: "taskExecuteType Required",
            };
        }
        return null;
    },

    (node) => {
        if (node?.data?.generate_sink_sql === false) {
            if (!node.data?.fieldCheck || node.data?.fieldCheck === false) {
                return {
                    nodeId: node.id,
                    nodeType: node.data.nodeType,
                    dbType: node.data.dbType,
                    title: node.data.title,
                    level: "warning",
                    field: "fieldCheck",
                    message: "Field validation failed",
                };
            }
        }

        return null;
    },

    (node) => {
        if (node.data?.taskExecuteType !== "SINGLE_TABLE") {
            return null;
        }
        if (!node.data?.table) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "table",
                message: "table Required",
            };
        }
        return null;
    },

    (node) => {
        if (node.data?.taskExecuteType !== "TABLE_CUSTOM") {
            return null;
        }
        if (!node.data?.query) {
            return {
                nodeId: node.id,
                nodeType: node.data.nodeType,
                dbType: node.data.dbType,
                title: node.data.title,
                level: "warning",
                field: "query",
                message: "query Required",
            };
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
        const nodeType = node.data.nodeType;
        const dbType = node.data.dbType;
        const title = node.data.title;
        const rules = nodeRuleMap[nodeType];
        if (!rules) return;

        rules.forEach((rule) => {
            try {
                const r = rule(node);
                if (r) result.push(r);
            } catch (err) {
                result.push({
                    nodeId: node.id,
                    nodeType: nodeType,
                    dbType: dbType,
                    title: title,
                    level: "error",
                    message: "Node check rule execution error",
                });
            }
        });
    });

    return result;
};


export const classifyCheckResult = (list: CheckItem[]) => {
    return {
        errors: list.filter((i) => i.level === "error"),
        warnings: list.filter((i) => i.level === "warning"),
        total: list.length,
    };
};
