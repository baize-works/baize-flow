export const TASK_TYPE_OPTIONS = [
  {
    label: '单表同步',
    value: 'SINGLE_TABLE',
    description: '将单个表的全部数据同步到目标表',
  },
  {
    label: '单表自定义同步',
    value: 'SINGLE_TABLE_CUSTOM',
    description: '将单个表的全部数据同步到目标表',
  },
   {
    label: '多表同步',
    value: 'MULTI_TABLE',
    description: '将多个表的全部数据同步到目标表',
  }
];

export type TaskType = typeof TASK_TYPE_OPTIONS[number]['value'];