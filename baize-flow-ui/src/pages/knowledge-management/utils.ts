import { MenuKey, ParamItem } from "./types";

export const filterListByKeyword = (
  list: ParamItem[],
  activeMenu: MenuKey,
  keyword: string
) => {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return list;

  return list.filter((item) => {
    const fields = [
      item.paramName,
      item.paramDesc,
      item.defaultValue,
      item.exampleValue,
      activeMenu === "connector" && item.type === "connector"
        ? item.connectorName
        : "",
      activeMenu === "connector" && item.type === "connector"
        ? item.paramType
        : "",
      activeMenu === "time" && item.type === "time" ? item.timeFormat : "",
      activeMenu === "time" && item.type === "time" ? item.expression || "" : "",
    ];

    return fields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(kw)
    );
  });
};