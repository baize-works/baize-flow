
import { CDC_SERVER_ID_DEFAULTS } from '../serverId';
import type { DbTypeValue, TableItem } from './types';

export const DEFAULT_DB_TYPE: DbTypeValue = {
  dbType: 'MYSQL',
  connectorType: 'Jdbc',
};

export const DEFAULT_FORM_VALUES = {
  matchMode: '1',
  fetchSize: 8000,
  splitSize: 8096,
  schemaSaveMode: 'CREATE_SCHEMA_WHEN_NOT_EXIST',
  dataSaveMode: 'APPEND_DATA',
  batchSize: 10000,
  enableUpsert: true,
  fieldIde: 'ORIGINAL',
  ...CDC_SERVER_ID_DEFAULTS,
  serverIdMode: 'MANUAL',
  serverId: '',

};

export const SCHEMA_SAVE_MODE_OPTIONS = [
  { label: '不存在则创建', value: 'CREATE_SCHEMA_WHEN_NOT_EXIST' },
  { label: '重新创建', value: 'RECREATE_SCHEMA' },
  { label: '不存在则报错', value: 'ERROR_WHEN_SCHEMA_NOT_EXIST' },
  { label: '忽略', value: 'IGNORE' },
];

export const DATA_SAVE_MODE_OPTIONS = [
  { label: '追加数据', value: 'APPEND_DATA' },
  { label: '清空后写入', value: 'DROP_DATA' },
];

export const FIELD_IDE_OPTIONS = [
  { label: '保持原样', value: 'ORIGINAL' },
  { label: '转大写', value: 'UPPERCASE' },
  { label: '转小写', value: 'LOWERCASE' },
];

export const buildDataSourceOptions = (list: any[] = []) => {
  return list.map((item) => ({
    label: item.name || item.dataSourceName || item.id,
    value: item.id,
    ...item,
  }));
};

export const buildTableItems = (list: any[] = []): TableItem[] => {
  return list.map((item: any) => {
    const tableName = typeof item === 'string' ? item : item.value;
    return {
      key: String(tableName),
      title: String(item.label ?? tableName),
      rawTitle: String(tableName).toLowerCase(),
    };
  });
};

export const SERVER_ID_PATTERN = /^(?:[1-9]\d*)(?:-(?:[1-9]\d*))?$/;

export const validateServerIdRange = (value?: string) => {
  const serverId = String(value || '').trim();

  if (!serverId) {
    return { valid: true };
  }

  if (!SERVER_ID_PATTERN.test(serverId)) {
    return {
      valid: false,
      message: 'server-id 仅支持正整数或区间，例如 5400 或 5400-5408',
    };
  }

  const [startText, endText] = serverId.split('-');
  const start = Number(startText);
  const end = endText ? Number(endText) : start;

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
    return { valid: false, message: 'server-id 超出安全整数范围' };
  }

  if (start <= 0 || end <= 0) {
    return { valid: false, message: 'server-id 必须大于 0' };
  }

  if (start > end) {
    return { valid: false, message: 'server-id 区间起始值不能大于结束值' };
  }

  if (end > 4294967295) {
    return { valid: false, message: 'server-id 不能超过 4294967295' };
  }

  return { valid: true };
};

