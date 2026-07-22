import { memo } from "react";
import FieldMapperPanel from "../FieldMapperPanel";
import SqlTransformPanel from "../SqlTransformPanel";

interface FieldMapperLinkedNodeIds {
  sourceNodeId?: string;
  sinkNodeId?: string;
}

interface Props {
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
}

function TransformPanel(props: Props) {
  const componentType = props.selectedNode?.data?.componentType;

  if (componentType === "FIELDMAPPER") {
    return <FieldMapperPanel {...props} />;
  }

  if (componentType === "SQL") {
    return <SqlTransformPanel {...props} />;
  }

  return null;
}

export default memo(TransformPanel);
