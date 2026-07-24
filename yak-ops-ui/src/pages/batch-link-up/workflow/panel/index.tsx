import type { FC } from "react";
import { memo } from "react";

import SinkPanel from "./components/SinkPanel";
import SourcePanel from "./components/SourcePanel";
import TransformPanel from "./components/TransformPanel";
import "./index.less";

interface FieldMapperLinkedNodeIds {
  sourceNodeId?: string;
  sinkNodeId?: string;
}

interface WorkflowPanelProps {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  getFieldMapperLinkedNodeIds: (nodeId: string) => FieldMapperLinkedNodeIds;
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
  syncTransformPluginConfig: (nodeId: string) => {
    pluginInput?: string;
    pluginOutput?: string;
  };
  scheduleConfig: any;
}

const WorkflowPanel: FC<WorkflowPanelProps> = ({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  getFieldMapperLinkedNodeIds,
  refreshNodeSchema,
  refreshDownstreamSchemas,
  syncTransformPluginConfig,
  scheduleConfig
}) => {
  const nodeType = selectedNode?.data?.nodeType;

  if (!selectedNode || !nodeType) return null;

  if (nodeType === "source") {
    return (
      <SourcePanel
        selectedNode={selectedNode}
        onClose={onClose}
        onNodeDataChange={onNodeDataChange}
        scheduleConfig={scheduleConfig}
      />
    );
  }

  if (nodeType === "sink") {
    return (
      <SinkPanel
        selectedNode={selectedNode}
        onClose={onClose}
        onNodeDataChange={onNodeDataChange}
      />
    );
  }

  if (nodeType === "transform") {
    return (
      <TransformPanel
        selectedNode={selectedNode}
        onClose={onClose}
        onNodeDataChange={onNodeDataChange}
        getDirectUpstreamSchema={getDirectUpstreamSchema}
        getFieldMapperLinkedNodeIds={getFieldMapperLinkedNodeIds}
        refreshNodeSchema={refreshNodeSchema}
        refreshDownstreamSchemas={refreshDownstreamSchemas}
        syncTransformPluginConfig={syncTransformPluginConfig}
      />
    );
  }

  return null;
};

export default memo(WorkflowPanel);
