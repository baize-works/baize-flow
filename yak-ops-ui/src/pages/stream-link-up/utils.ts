export const getTypeIcon = (type?: string) => {
  const normalized = String(type || "").toUpperCase();

  if (normalized.includes("MYSQL")) return "🐬";
  if (normalized.includes("POSTGRESQL")) return "🐘";
  if (normalized.includes("POSTGRE_SQL")) return "🐘";
  if (normalized.includes("KINGBASE")) return "KB";
  if (normalized.includes("DAMENG")) return "DM";
  if (normalized.includes("KAFKA")) return "✣";
  if (normalized.includes("STARROCKS")) return "◆";
  if (normalized.includes("ELASTICSEARCH")) return "◒";
  if (normalized.includes("DORIS")) return "⬢";

  return "●";
};
