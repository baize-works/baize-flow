export const CDC_SERVER_ID_DEFAULTS = {
  serverIdMode: 'MANUAL',
  serverId: '',
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
