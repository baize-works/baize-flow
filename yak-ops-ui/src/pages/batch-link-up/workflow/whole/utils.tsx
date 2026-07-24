import React from "react";
import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { TableOutlined } from "@ant-design/icons";
import type { TableItem } from "./types";

export const DEFAULT_DB_TYPE = {
  dbType: "MYSQL",
  connectorType: "Jdbc",
  pluginName: "JDBC-MYSQL",
};

export const safeParseDraft = (draftStr?: string) => {
  if (!draftStr) return null;
  try {
    return JSON.parse(draftStr);
  } catch (error) {
    console.error("Failed to parse draft:", error);
    return null;
  }
};

export const isGraphDraft = (draft: any) => {
  return !!draft && typeof draft === "object" && "nodes" in draft;
};

export const buildDataSourceOptions = (list: any[] = []) => {
  return list.map((item) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <DatabaseIcons dbType={item?.label} width="18" height="18" />
        &nbsp;&nbsp;{item?.label}
      </div>
    ),
    value: item.value,
  }));
};

export const buildTableItems = (list: any[] = []): TableItem[] => {
  return list.map((item: any) => ({
    key: item.value,
    rawTitle: item.label,
    title: (
      <div>
        <TableOutlined style={{ color: "orange" }} />
        &nbsp;&nbsp;
        {item.label}
      </div>
    ),
  }));
};