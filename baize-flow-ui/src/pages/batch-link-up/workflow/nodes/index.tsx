import {
  memo,
  useMemo,
} from 'react'
import type { NodeProps } from 'reactflow'
import { BlockEnum, NodeComponentMap } from './constants'
import { message } from 'antd'

const CustomNode = (props: NodeProps) => {
  const nodeData = props.data;

  if (!nodeData?.nodeType) {
    return <div>nodeType 缺失</div>;
  }

  const NodeComponent = NodeComponentMap[nodeData.nodeType];

  if (!NodeComponent) {
    return <div>未知节点类型：{nodeData.nodeType}</div>;
  }

  return (
    <div>
      <NodeComponent {...props} />
    </div>
  );
};

export default memo(CustomNode);