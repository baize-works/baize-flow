export type EditorSyncState = "UNPUBLISHED" | "SYNCED" | "DIRTY";

export type JobReleaseState = "ONLINE" | "OFFLINE" | string;

export type JobDefinitionState = {
  /**
   * 编辑器内容和数据库内容的同步状态
   *
   * UNPUBLISHED: 页面内容还没有发布
   * SYNCED: 页面内容已经发布，和数据库一致
   * DIRTY: 页面内容已修改，但还没有重新发布
   */
  editorSyncState: EditorSyncState;

  /**
   * 任务发布状态 / 上线状态
   */
  releaseState?: JobReleaseState;

  /**
   * 任务版本
   */
  jobVersion?: number | null;

  /**
   * 内容版本
   */
  contentVersion?: number | null;
};

const EDITOR_SYNC_STATES: EditorSyncState[] = [
  "UNPUBLISHED",
  "SYNCED",
  "DIRTY",
];

const normalizeEditorSyncState = (value?: string): EditorSyncState => {
  if (EDITOR_SYNC_STATES.includes(value as EditorSyncState)) {
    return value as EditorSyncState;
  }

  return "UNPUBLISHED";
};

export const buildUnpublishedJobDefinitionState = (): JobDefinitionState => {
  return {
    editorSyncState: "UNPUBLISHED",
    releaseState: "OFFLINE",
    jobVersion: null,
    contentVersion: null,
  };
};

export const normalizeJobDefinitionState = (
  state?: Partial<JobDefinitionState> | null
): JobDefinitionState => {
  if (!state) {
    return buildUnpublishedJobDefinitionState();
  }

  return {
    editorSyncState: normalizeEditorSyncState(
      String(state.editorSyncState || "")
    ),
    releaseState: state.releaseState || "OFFLINE",
    jobVersion: state.jobVersion ?? null,
    contentVersion: state.contentVersion ?? null,
  };
};

export const markJobDefinitionDirty = (
  state?: Partial<JobDefinitionState> | null
): JobDefinitionState => {
  const normalized = normalizeJobDefinitionState(state);

  /**
   * 新建任务还没发布时，页面修改后仍然保持 UNPUBLISHED。
   * 已发布任务修改后，才变成 DIRTY。
   */
  if (normalized.editorSyncState === "UNPUBLISHED") {
    return normalized;
  }

  return {
    ...normalized,
    editorSyncState: "DIRTY",
  };
};

export const markJobDefinitionSynced = (
  state?: Partial<JobDefinitionState> | null
): JobDefinitionState => {
  const normalized = normalizeJobDefinitionState(state);

  return {
    ...normalized,
    editorSyncState: "SYNCED",
  };
};

export const canRunByDefinitionState = (
  state?: Partial<JobDefinitionState> | null
): boolean => {
  const normalized = normalizeJobDefinitionState(state);
  return normalized.editorSyncState === "SYNCED";
};

export const getRunDisabledReasonByState = (
  state?: Partial<JobDefinitionState> | null
): string => {
  const normalized = normalizeJobDefinitionState(state);

  if (normalized.editorSyncState === "UNPUBLISHED") {
    return "请先发布任务，再执行";
  }

  if (normalized.editorSyncState === "DIRTY") {
    return "当前内容已变更，请重新发布后再执行";
  }

  return "";
};