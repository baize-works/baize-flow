export enum ConfigOperate {
  Add,
  Edit,
}

export type ConfigProps = {
  id?: number;
  dsType?: string;
  valueName?: string;
  value?: string;
  status?: 1 | 2;
  url?: string;
  customParams?: string;
  dsName?: string;
};

export type AddConfigProps = Omit<ConfigProps, 'id' | 'operator'>;
export type EditConfigProps = Omit<ConfigProps, 'operator'>;


export const sourceList = [
  {
    groupName: "关系型数据库",
    datasourceList: [

      {
        onlyDiScript: false,
        dbType: "MYSQL",
        type: "MYSQL",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "ORACLE",
        type: "ORACLE",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "POSTGRE_SQL",
        type: "POSTGRE_SQL",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "KINGBASE",
        type: "KINGBASE",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "DAMENG",
        type: "DAMENG",
        connectorType: "Jdbc"
      },

    ],
  }
];
