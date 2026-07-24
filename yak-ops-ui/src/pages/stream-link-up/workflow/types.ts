export type TabKey = "basic" | "schedule" | "mapping" | "env";

export interface TabDefinition {
  key: TabKey;
  label: string;
  content: React.ReactNode;
}

export interface NodeField {
  name: string;
  type?: string;
  nullable?: boolean;
  comment?: string;

  originNodeId?: string;
  originFieldName?: string;
}

export interface SourceNodeConfig {
  sourceDataSourceId: string;
  readMode: "table" | "sql";
  sourceTable?: string;
  sql?: string;
  extraParams?: Array<{ key: string; value: string }>;
}

export interface SourceNodeMeta {
  outputSchema: NodeField[];
  schemaStatus?: "idle" | "loading" | "success" | "error";
  schemaError?: string;
}

export interface SourceNodeData {
  nodeType: "source";
  title: string;
  description?: string;
  dbType?: string;

  config: SourceNodeConfig;
  meta: SourceNodeMeta;
}

export interface FieldMappingItem {
  id: string;
  sourceField: string;
  targetField: string;
  targetType?: string;
  expression?: string;
  enabled?: boolean;
}

export interface FieldMapperNodeConfig {
  mappings: FieldMappingItem[];
  passThroughUnmapped?: boolean;
}

export interface TransformNodeMeta {
  inputSchema: NodeField[];
  outputSchema: NodeField[];
  schemaStatus?: "idle" | "loading" | "success" | "error";
  schemaError?: string;
}

export interface FieldMapperNodeData {
  nodeType: "transform";
  componentType: "FIELDMAPPER";
  label: string;
  title?: string;
  description?: string;

  config: FieldMapperNodeConfig;
  meta: TransformNodeMeta;
}

export interface FieldMappingItem {
  id: string;
  sourceField: string;
  targetField: string;
  targetType?: string;
  expression?: string;
  enabled?: boolean;
}

export interface FieldMapperNodeConfig {
  mappings: FieldMappingItem[];
  passThroughUnmapped?: boolean;
}

export interface TransformNodeMeta {
  inputSchema: NodeField[];
  outputSchema: NodeField[];
  schemaStatus?: "idle" | "loading" | "success" | "error";
  schemaError?: string;
}

export interface FieldMapperNodeData {
  nodeType: "transform";
  componentType: "FIELDMAPPER";
  label: string;
  title?: string;
  description?: string;

  config: FieldMapperNodeConfig;
  meta: TransformNodeMeta;
}

interface EnvConfig {
  jobMode: "BATCH" | "STREAMING";
  parallelism: number;
}

