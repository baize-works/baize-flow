import { SearchOutlined } from '@ant-design/icons';
import { Dropdown, Input } from 'antd';
import { Braces, Database } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  type Edge,
  MiniMap,
  type Node,
  SelectionMode,
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CanvasToolbar from '../../common/workflow/CanvasToolbar';
import {
  type InsertableTransformNode,
  insertableTransformNodes,
  TRANSFORM_NODE_DROP_OFFSET,
} from '../../common/workflow/graph';
import { ControlMode } from './config';
import CustomEdge from './edge';
import useFlowBuilder from './hooks/useFlowBuilder';
import useNodePlacement from './hooks/useNodePlacement';
import CustomNode from './nodes';
import WorkflowPanel from './panel';

const nodeTypesConfig = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1;
const EDGE_INSERT_MENU_WIDTH = 208;
const EDGE_INSERT_MENU_GAP = 12;
const EDGE_INSERT_INFO_CARD_WIDTH = 188;
const EDGE_INSERT_INFO_CARD_GAP = 10;

const insertNodeIconMap: Record<string, React.ReactNode> = {
  FIELDMAPPER: <Braces size={15} />,
  SQL: <Database size={15} />,
};

interface EdgeInsertMenuState {
  edgeId: string;
  flowPosition: { x: number; y: number };
  screenPosition: { x: number; y: number };
}

interface HoveredInsertNodeState {
  nodeConfig: InsertableTransformNode;
  itemRect: DOMRect;
}

interface FlowCanvasProps {
  form: any;
  params: any;
  goBack: () => void;
  sourceType?: any;
  targetType?: any;
  onWorkflowChange?: (value: { nodes: any[]; edges: any[] }) => void;
  scheduleConfig?: any;
}

function buildInitialGraph(
  params?: any,
  sourceType?: any,
  targetType?: any,
): {
  nodes: Node[];
  edges: Edge[];
} {
  if (params?.workflow?.nodes?.length) {
    return {
      nodes: params.workflow.nodes || [],
      edges: params.workflow.edges || [],
    };
  }

  const timestamp = Date.now();
  const sourceId = `source-${timestamp}`;
  const sinkId = `sink-${timestamp}`;

  const sourceDbType = sourceType?.dbType || 'MYSQL';
  const targetDbType = targetType?.dbType || 'MYSQL';

  const sourceTitle =
    sourceType?.dbType ||
    sourceType?.pluginName ||
    sourceType?.connectorType ||
    '输入端';

  const sinkTitle =
    targetType?.dbType ||
    targetType?.pluginName ||
    targetType?.connectorType ||
    '输出端';

  const nodes: Node[] = [
    {
      id: sourceId,
      type: 'custom',
      position: { x: 100, y: 180 },
      data: {
        nodeType: 'source',
        title: sourceTitle,
        description: '读取源端数据',
        dbType: sourceDbType,
        connectorType: sourceType?.connectorType,
        pluginName: sourceType?.pluginName,
        config: {
          dataSourceId: params?.sourceDataSourceId || '',
          dbType: sourceType?.dbType,
          connectorType: sourceType?.connectorType,
          pluginName: sourceType?.pluginName,
          pluginOutput: sourceId,
          readMode: 'table',
          table: undefined,
          sql: '',
          extraParams: [],
        },
        meta: {
          outputSchema: [],
          schemaStatus: 'idle',
          schemaError: '',
        },
      },
    },
    {
      id: sinkId,
      type: 'custom',
      position: { x: 460, y: 180 },
      data: {
        nodeType: 'sink',
        title: sinkTitle,
        description: '写入目标端数据',
        dbType: targetDbType,
        connectorType: targetType?.connectorType,
        pluginName: targetType?.pluginName,
        config: {
          dataSourceId: params?.targetDataSourceId || '',
          autoCreateTable: false,
          targetMode: 'table',
          table: undefined,
          targetTableName: '',
          sql: '',
          writeMode: 'append',
          primaryKey: '',
          batchSize: '',
          pluginInput: sinkId,
          extraParams: [],
        },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: `${sourceId}-${sinkId}`,
      source: sourceId,
      target: sinkId,
      type: 'custom',
      data: {},
    },
  ];

  return { nodes, edges };
}

export default function FlowCanvas({
  form,
  params,
  goBack: _goBack,
  sourceType,
  targetType,
  onWorkflowChange,
  scheduleConfig,
}: FlowCanvasProps) {
  const store = useStoreApi();
  const flow = useFlowBuilder({ form, params });
  const placement = useNodePlacement({
    setNodes: flow.setNodes,
    setControlMode: flow.setControlMode,
  });
  const initializedRef = useRef(false);
  const [edgeInsertMenu, setEdgeInsertMenu] =
    useState<EdgeInsertMenuState | null>(null);
  const [edgeInsertSearchText, setEdgeInsertSearchText] = useState('');
  const [hoveredInsertNode, setHoveredInsertNode] =
    useState<HoveredInsertNodeState | null>(null);

  const closeEdgeInsertMenu = useCallback(() => {
    setEdgeInsertMenu(null);
    setEdgeInsertSearchText('');
    setHoveredInsertNode(null);
  }, []);

  const openEdgeInsertMenu = useCallback(
    (
      edgeId: string,
      payload: {
        flowPosition: { x: number; y: number };
        screenPosition: { x: number; y: number };
      },
    ) => {
      flow.selectEdge(edgeId);
      setEdgeInsertMenu({
        edgeId,
        flowPosition: payload.flowPosition,
        screenPosition: payload.screenPosition,
      });
    },
    [flow.selectEdge],
  );

  const handleInsertNodeFromMenu = useCallback(
    (nodeConfig: InsertableTransformNode) => {
      if (!edgeInsertMenu) return;

      flow.insertNodeOnEdge(
        edgeInsertMenu.edgeId,
        edgeInsertMenu.flowPosition,
        nodeConfig,
      );
      closeEdgeInsertMenu();
    },
    [closeEdgeInsertMenu, edgeInsertMenu, flow.insertNodeOnEdge],
  );

  const edgeInsertMenuNodes = useMemo(
    () => {
      const normalizedSearchText = edgeInsertSearchText.trim().toLowerCase();

      if (!normalizedSearchText) return insertableTransformNodes;

      return insertableTransformNodes.filter((nodeConfig) =>
        [
          nodeConfig.label,
          nodeConfig.description,
          nodeConfig.componentType,
          nodeConfig.nodeType,
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedSearchText)),
      );
    },
    [edgeInsertSearchText],
  );

  const edgeInsertMenuPosition = useMemo(
    () => {
      if (!edgeInsertMenu) return { left: 0, top: 0 };

      return {
        left: edgeInsertMenu.screenPosition.x + EDGE_INSERT_MENU_GAP,
        top: edgeInsertMenu.screenPosition.y,
      };
    },
    [edgeInsertMenu],
  );

  const edgeInsertInfoCardPosition = useMemo(
    () => {
      if (!hoveredInsertNode) return { left: 0, top: 0 };

      const rightSideLeft =
        hoveredInsertNode.itemRect.right + EDGE_INSERT_INFO_CARD_GAP;
      const leftSideLeft =
        hoveredInsertNode.itemRect.left -
        EDGE_INSERT_INFO_CARD_WIDTH -
        EDGE_INSERT_INFO_CARD_GAP;
      const hasRightSpace =
        rightSideLeft + EDGE_INSERT_INFO_CARD_WIDTH <= window.innerWidth - 8;

      return {
        left: hasRightSpace ? rightSideLeft : Math.max(8, leftSideLeft),
        top:
          hoveredInsertNode.itemRect.top +
          hoveredInsertNode.itemRect.height / 2,
      };
    },
    [hoveredInsertNode],
  );

  const interactiveEdges = useMemo(
    () =>
      flow.edges.map((edge) => ({
        ...edge,
        type: edge.type || 'custom',
        selected: edge.id === flow.selectedEdgeId,
        data: {
          ...(edge.data || {}),
          onEdgeClick: flow.onEdgeClick,
          onEdgeMouseEnter: flow.onEdgeMouseEnter,
          onEdgeMouseLeave: flow.onEdgeMouseLeave,
          onOpenInsertMenu: openEdgeInsertMenu,
        },
      })),
    [
      flow.edges,
      flow.onEdgeClick,
      flow.onEdgeMouseEnter,
      flow.onEdgeMouseLeave,
      openEdgeInsertMenu,
    ],
  );

  useEffect(() => {
    onWorkflowChange?.({
      nodes: flow.nodes,
      edges: flow.edges,
    });
  }, [flow.nodes, flow.edges, onWorkflowChange]);

  useEffect(() => {
    if (!params || initializedRef.current) return;

    const hasNodes = Array.isArray(flow.nodes) && flow.nodes.length > 0;
    if (hasNodes) {
      initializedRef.current = true;
      return;
    }

    const { nodes, edges } = buildInitialGraph(params, sourceType, targetType);

    flow.setNodes(nodes);
    flow.setEdges(edges);
    initializedRef.current = true;
  }, [
    params,
    sourceType,
    targetType,
    flow.nodes,
    flow.setNodes,
    flow.setEdges,
  ]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    closeEdgeInsertMenu();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    closeEdgeInsertMenu();
    event.preventDefault();

    const raw = event.dataTransfer.getData('application/reactflow');
    if (!raw) return;

    const data = JSON.parse(raw);

    const pointerPosition = flow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    flow.addNode({
      position: {
        x: pointerPosition.x - TRANSFORM_NODE_DROP_OFFSET.x,
        y: pointerPosition.y - TRANSFORM_NODE_DROP_OFFSET.y,
      },
      nodeType: data.nodeType,
      componentType: data.componentType,
      iconType: data.iconType,
      label: data.label,
    });
  };

  const handlePaneClick = useCallback(
    () => {
      closeEdgeInsertMenu();
      flow.onPaneClick();
    },
    [closeEdgeInsertMenu, flow.onPaneClick],
  );

  const clearSelectionRect = useCallback(() => {
    store.setState({
      userSelectionActive: false,
      userSelectionRect: null,
    });

    requestAnimationFrame(() => {
      store.setState({
        userSelectionActive: false,
        userSelectionRect: null,
      });
    });
  }, [store]);

  useEffect(() => {
    if (!edgeInsertMenu) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEdgeInsertMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeEdgeInsertMenu, edgeInsertMenu]);

  return (
    <div
      className="relative h-full w-full min-w-[960px]"
      style={{
        height: '100%',
        width: '100%',
        cursor: flow.controlMode === ControlMode.Hand ? 'grab' : 'default',
      }}
      ref={placement.reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CanvasToolbar
        canDeleteEdge={flow.canDeleteEdge}
        canRedo={flow.canRedo}
        canUndo={flow.canUndo}
        controlMode={flow.controlMode}
        onAutoLayout={flow.autoLayout}
        onControlModeChange={flow.toggleControlMode}
        onDeleteEdge={flow.deleteActiveEdge}
        onFitView={flow.fitWorkflowView}
        onRedo={flow.redo}
        onUndo={flow.undo}
      />

      <ReactFlow
        nodes={flow.nodes}
        edges={interactiveEdges}
        nodeTypes={nodeTypesConfig}
        edgeTypes={edgeTypes}
        onNodesChange={flow.onNodesChange}
        onEdgesChange={flow.onEdgesChange}
        onConnect={flow.onConnect}
        onNodeClick={flow.onNodeClick}
        onEdgeClick={flow.onEdgeClick}
        onNodeContextMenu={flow.onNodeContextMenu}
        onPaneClick={handlePaneClick}
        onSelectionChange={flow.onSelectionChange}
        onSelectionEnd={clearSelectionRect}
        onSelectionContextMenu={flow.onSelectionContextMenu}
        onNodeMouseEnter={flow.onNodeMouseEnter}
        onNodeMouseLeave={flow.onNodeMouseLeave}
        onPaneContextMenu={flow.onPaneContextMenu}
        isValidConnection={flow.isValidConnection}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        nodesDraggable={
          !flow.nodesReadOnly && flow.controlMode === ControlMode.Pointer
        }
        nodesConnectable={!flow.nodesReadOnly}
        nodesFocusable={!flow.nodesReadOnly}
        edgesFocusable={!flow.nodesReadOnly}
        panOnDrag={flow.controlMode === ControlMode.Hand}
        zoomOnPinch={!flow.workflowReadOnly}
        zoomOnScroll={!flow.workflowReadOnly}
        zoomOnDoubleClick={!flow.workflowReadOnly}
        selectionOnDrag={
          flow.controlMode === ControlMode.Pointer && !flow.workflowReadOnly
        }
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.25,
          maxZoom: 0.75,
        }}
        className={`reactflow-wrapper ${
          flow.controlMode === ControlMode.Hand ? 'hand-mode' : 'pointer-mode'
        }`}
      >
        <Background gap={[14, 14]} size={2} color="#8585ad26" />

        <MiniMap
          className="workflow-minimap"
          position="bottom-left"
          style={{ width: 102, height: 72 }}
          maskColor="#E9EBF0"
        />
      </ReactFlow>

      {edgeInsertMenu && (
        <div
          className="edge-insert-menu nodrag nopan"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            position: 'fixed',
            left: edgeInsertMenuPosition.left,
            top: edgeInsertMenuPosition.top,
            width: EDGE_INSERT_MENU_WIDTH,
            maxHeight: 520,
            padding: 8,
            background: '#fff',
            border: '1px solid #e4e7ec',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(16, 24, 40, 0.16)',
            transform: 'translateY(-50%)',
            zIndex: 1000,
          }}
        >
          <Input
            allowClear
            autoFocus
            className="edge-insert-search"
            prefix={<SearchOutlined style={{ color: '#98a2b3' }} />}
            placeholder="搜索节点"
            value={edgeInsertSearchText}
            onChange={(event) => setEdgeInsertSearchText(event.target.value)}
          />

          <div className="edge-insert-divider" />

          <div style={{ maxHeight: 456, overflowY: 'auto' }}>
            {edgeInsertMenuNodes.map((nodeConfig) => (
              <div
                key={nodeConfig.componentType}
                className="edge-insert-node-item"
                onClick={() => handleInsertNodeFromMenu(nodeConfig)}
                onMouseEnter={(event) => {
                  setHoveredInsertNode({
                    nodeConfig,
                    itemRect: event.currentTarget.getBoundingClientRect(),
                  });
                }}
                onMouseLeave={() => setHoveredInsertNode(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                  {insertNodeIconMap[nodeConfig.componentType]}
                </div>
                <div
                  className="truncate text-[14px] leading-[20px] text-slate-800"
                  style={{ minWidth: 0 }}
                >
                  {nodeConfig.label}
                </div>
              </div>
            ))}

            {edgeInsertMenuNodes.length === 0 && (
              <div
                style={{
                  padding: '16px 0',
                  textAlign: 'center',
                  color: '#98a2b3',
                  fontSize: 13,
                }}
              >
                暂无匹配节点
              </div>
            )}
          </div>
        </div>
      )}

      {hoveredInsertNode && (
        <div
          className="edge-insert-info-card nodrag nopan"
          style={{
            position: 'fixed',
            left: edgeInsertInfoCardPosition.left,
            top: edgeInsertInfoCardPosition.top,
            width: EDGE_INSERT_INFO_CARD_WIDTH,
            transform: 'translateY(-50%)',
            zIndex: 1001,
          }}
        >
          <div className="edge-insert-info-icon">
            {insertNodeIconMap[hoveredInsertNode.nodeConfig.componentType]}
          </div>
          <div className="edge-insert-info-title">
            {hoveredInsertNode.nodeConfig.label}
          </div>
          <div className="edge-insert-info-desc">
            {hoveredInsertNode.nodeConfig.description}
          </div>
        </div>
      )}

      <Dropdown
        overlay={flow.renderContextMenu()}
        open={flow.menuVisible}
        onOpenChange={flow.closeContextMenu}
        trigger={['contextMenu']}
      >
        <div
          style={{
            position: 'fixed',
            left: flow.menuPosition.x,
            top: flow.menuPosition.y,
            width: '1px',
            height: '1px',
          }}
        />
      </Dropdown>

      {flow.drawerVisible && (
        <WorkflowPanel
          selectedNode={flow.selectedNode}
          onClose={flow.onCloseDrawer}
          onNodeDataChange={flow.handleNodeDataChange}
          getDirectUpstreamSchema={flow.getDirectUpstreamSchema}
          getFieldMapperLinkedNodeIds={flow.getFieldMapperLinkedNodeIds}
          refreshNodeSchema={flow.refreshNodeSchema}
          refreshDownstreamSchemas={flow.refreshDownstreamSchemas}
          syncTransformPluginConfig={flow.syncTransformPluginConfig}
          scheduleConfig={scheduleConfig}
        />
      )}
    </div>
  );
}
