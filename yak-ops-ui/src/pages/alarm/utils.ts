/** 后端时间为 Date 序列化（时间戳或字符串），统一格式化为 YYYY-MM-DD HH:mm:ss */
export function formatTime(t: unknown): string {
  if (t === null || t === undefined || t === '') return '-';
  const d = new Date(t as any);
  if (Number.isNaN(d.getTime())) return String(t);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
