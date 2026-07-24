import { Menu, message } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import {
  createTransformNode,
  createWorkflowEdge,
  type InsertableTransformNode,
  layoutWorkflowGraph,
  TRANSFORM_NODE_DROP_OFFSET,
} from "../../../common/workflow/graph";
import { ControlMode } from "../config";

interface Props {
  form: any;
  params: any;
}

interface FlowSnapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY_SIZE = 50;

const cloneSnapshot = (snapshot: FlowSnapshot): FlowSnapshot => ({
  nodes: snapshot.nodes.map((node) => ({
    ...node,
    position: { ...node.position },
    data: node.data ? { ...node.data } : node.data,
    style: node.style ? { ...node.style } : node.style,
  })),
  edges: snapshot.edges.map((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : edge.data,
    style: edge.style ? { ...edge.style } : edge.style,
  })),
});

export default function useFlowBuilder({ form, params }: Props) {
  const { getNodes, getEdges, fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [controlMode, setControlMode] = useState<string>(ControlMode.Pointer);
  const [nodesReadOnly] = useState(false);
  const [workflowReadOnly] = useState(false);
  const [interactionMode] = useState(ControlMode.Pointer);

  const [runVisible, setRunVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [, setSelectedEdges] = useState<any[]>([]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const didFitViewRef = useRef(false);
  const latestNodesRef = useRef<Node[]>([]);
  const latestEdgesRef = useRef<Edge[]>([]);
  const undoStackRef = useRef<FlowSnapshot[]>([]);
  const redoStackRef = useRef<FlowSnapshot[]>([]);
  const isNodeDraggingRef = useRef(false);
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });

  const updateHistoryState = useCallback(() => {
    setHistoryState({
      canUndo: undoStackRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
    });
  }, []);

  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    isNodeDraggingRef.current = false;
    updateHistoryState();
  }, [updateHistoryState]);

  const pushHistory = useCallback(() => {
    undoStackRef.current = undoStackRef.current
      .concat(
        cloneSnapshot({
          nodes: latestNodesRef.current,
          edges: latestEdgesRef.current,
        })
      )
      .slice(-MAX_HISTORY_SIZE);
    redoStackRef.current = [];
    updateHistoryState();
  }, [updateHistoryState]);

  const restoreSnapshot = useCallback(
    (snapshot: FlowSnapshot) => {
      const nextSnapshot = cloneSnapshot(snapshot);
      setNodes(nextSnapshot.nodes);
      setEdges(nextSnapshot.edges);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setDrawerVisible(false);
      setMenuVisible(false);
    },
    [setEdges, setNodes]
  );

  const initializedJobIdRef = useRef<any>(null);

  useEffect(() => {
    if (!params) return;

    const currentJobId = params?.id ?? "new";

    /**
     * 同一个任务只初始化一次。
     * 避免发布成功后 setParams 触发画布重置。
     */
    if (initializedJobIdRef.current === currentJobId) {
      return;
    }

    initializedJobIdRef.current = currentJobId;

    form.setFieldsValue({
      jobName: params?.jobName,
      jobDesc: params?.jobDesc,
      clientId: params?.clientId,
      syncMode: "DAG",
    });

    if (params?.workflow) {
      clearHistory();
      setNodes(params.workflow?.nodes || []);
      setEdges(params.workflow?.edges || []);
      return;
    }

    if (params?.jobDefinitionInfo !== undefined) {
      const contentInfo =
        typeof params.jobDefinitionInfo === "string"
          ? JSON.parse(params.jobDefinitionInfo || "{}")
          : params.jobDefinitionInfo || {};

      clearHistory();
      setNodes(contentInfo?.nodes || []);
      setEdges(contentInfo?.edges || []);
    }
  }, [params?.id, form, clearHistory, setNodes, setEdges]);

  const undo = useCallback(() => {
    const previousSnapshot = undoStackRef.current.pop();
    if (!previousSnapshot) return;

    redoStackRef.current = redoStackRef.current.concat(
      cloneSnapshot({
        nodes: latestNodesRef.current,
        edges: latestEdgesRef.current,
      })
    );
    restoreSnapshot(previousSnapshot);
    updateHistoryState();
  }, [restoreSnapshot, updateHistoryState]);

  const redo = useCallback(() => {
    const nextSnapshot = redoStackRef.current.pop();
    if (!nextSnapshot) return;

    undoStackRef.current = undoStackRef.current.concat(
      cloneSnapshot({
        nodes: latestNodesRef.current,
        edges: latestEdgesRef.current,
      })
    );
    restoreSnapshot(nextSnapshot);
    updateHistoryState();
  }, [restoreSnapshot, updateHistoryState]);

  const fitWorkflowView = useCallback(() => {
    fitView({
      padding: 0.2,
      duration: 240,
      minZoom: 0.25,
      maxZoom: 0.75,
    });
  }, [fitView]);

  const autoLayout = useCallback(() => {
    const currentNodes = latestNodesRef.current;
    const currentEdges = latestEdgesRef.current;

    if (currentNodes.length === 0) return;

    pushHistory();
    setNodes(layoutWorkflowGraph(currentNodes, currentEdges));
    requestAnimationFrame(fitWorkflowView);
  }, [fitWorkflowView, pushHistory, setNodes]);

  useEffect(() => {
    latestNodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    latestEdgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (!params) return;

    form.setFieldsValue({
      jobName: params?.jobName,
      jobDesc: params?.jobDesc,
      clientId: params?.clientId,
      syncMode: "DAG",
    });

    // 1. 编辑模式优先使用后端返回的 workflow
    if (params?.workflow) {
      clearHistory();
      setNodes(params.workflow?.nodes || []);
      setEdges(params.workflow?.edges || []);
      return;
    }

    // 2. 兼容旧结构：jobDefinitionInfo
    if (params?.jobDefinitionInfo !== undefined) {
      const contentInfo =
        typeof params.jobDefinitionInfo === "string"
          ? JSON.parse(params.jobDefinitionInfo || "{}")
          : params.jobDefinitionInfo || {};

      clearHistory();
      setNodes(contentInfo?.nodes || []);
      setEdges(contentInfo?.edges || []);
    }
  }, [params, form, clearHistory, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length > 0 && !didFitViewRef.current) {
      didFitViewRef.current = true;
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 0 });
      }, 0);
    }
  }, [nodes, fitView]);

  useEffect(() => {
    const styleId = "reactflow-cursor-override";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML =
      controlMode === ControlMode.Hand
        ? `
          .react-flow__pane { cursor: grab !important; }
          .react-flow__pane:active { cursor: grabbing !important; }
        `
        : `
          .react-flow__pane { cursor: default !important; }
        `;

    return () => {
      styleElement?.remove();
    };
  }, [controlMode]);

  const addNode = useCallback(
    ({
      position,
      nodeType,
      label,
      componentType,
      iconType,
    }: {
      position: { x: number; y: number };
      nodeType: string;
      label: string;
      componentType: string;
      iconType?: string;
    }) => {
      const newNode = createTransformNode({
        position,
        nodeType,
        label,
        componentType,
        iconType,
      });

      pushHistory();
      setNodes((nds) => nds.concat(newNode));
    },
    [pushHistory, setNodes]
  );

  const insertNodeOnEdge = useCallback(
    (
      edgeId: string,
      position: { x: number; y: number },
      nodeConfig: InsertableTransformNode
    ) => {
      const edge = getEdges().find((item) => item.id === edgeId);

      if (!edge) return;

      pushHistory();

      const node = createTransformNode({
        ...nodeConfig,
        position: {
          x: position.x - TRANSFORM_NODE_DROP_OFFSET.x,
          y: position.y - TRANSFORM_NODE_DROP_OFFSET.y,
        },
      });

      const nextEdges = [
        createWorkflowEdge(edge.source, node.id),
        createWorkflowEdge(node.id, edge.target),
      ];

      setNodes((nds) => nds.concat(node));
      setEdges((eds) =>
        eds.filter((item) => item.id !== edgeId).concat(nextEdges)
      );
      setSelectedNodeId(node.id);
      setDrawerVisible(true);
    },
    [getEdges, pushHistory, setEdges, setNodes]
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      const shouldPushHistory = changes.some((change: any) => {
        if (change.type === "position") {
          if (change.dragging) {
            if (isNodeDraggingRef.current) return false;

            isNodeDraggingRef.current = true;
            return true;
          }

          if (isNodeDraggingRef.current) {
            isNodeDraggingRef.current = false;
            return false;
          }

          return true;
        }

        return change.type === "remove" || change.type === "add";
      });

      if (shouldPushHistory) {
        pushHistory();
      }

      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [pushHistory, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      if (
        changes.some(
          (change: any) => change.type === "remove" || change.type === "add"
        )
      ) {
        pushHistory();
      }

      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [pushHistory, setEdges]
  );

  const toggleControlMode = useCallback((mode: string) => {
    setControlMode(mode);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "#296dff";
      case "succeeded":
        return "#17b26a";
      case "failed":
        return "#ff4d4f";
      case "pending":
        return "#faad14";
      default:
        return undefined;
    }
  };

  const onNodeMouseEnter = useCallback(
    (_: any, node: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            if (!edge.data?.originalStroke) {
              edge.data = {
                ...edge.data,
                originalStroke:
                  edge.style?.stroke ||
                  getStatusColor(edge.data?.executionStatus) ||
                  "#d0d5dc",
              };
            }
            return {
              ...edge,
              style: { ...edge.style, stroke: "hsl(231 48% 48%)" },
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const onNodeMouseLeave = useCallback(
    (_: any, node: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke:
                  edge.data?.originalStroke ||
                  getStatusColor(edge.data?.executionStatus) ||
                  "#d0d5dc",
              },
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const isValidConnection = useCallback(() => true, []);

  const onConnect = useCallback(
    (connection: any) => {
      const nodes = getNodes();
      const edges = getEdges();

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      const isTransform =
        (sourceNode && sourceNode.data.nodeType === "transform") ||
        (targetNode && targetNode.data.nodeType === "transform");

      if (!sourceNode || !targetNode) return;

      if (isTransform) {
        const hasIncoming = edges.some((e) => e.target === targetNode.id);
        if (hasIncoming) {
          message.warning("Transform 节点只能有一个上游节点");
          return;
        }

        const hasOutgoing = edges.some((e) => e.source === sourceNode.id);
        if (hasOutgoing) {
          message.warning("Transform 节点只能有一个下游节点");
          return;
        }
      }

      if (isValidConnection()) {
        pushHistory();
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: `${connection.source}-${connection.target}-${Date.now()}`,
              type: "custom",
              data: {},
            },
            eds
          )
        );
      }
    },
    [getNodes, getEdges, isValidConnection, pushHistory, setEdges]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
    setDrawerVisible(true);
  }, []);

  const onEdgeClick = useCallback((_: any, edge?: any) => {
    const edgeId = typeof _ === "string" ? _ : edge?.id;

    if (!edgeId) return;

    setSelectedNodeId(null);
    setSelectedEdgeId(edgeId);
    setDrawerVisible(false);
  }, []);

  const onEdgeMouseEnter = useCallback((edgeId: string) => {
    setHoveredEdgeId(edgeId);
  }, []);

  const onEdgeMouseLeave = useCallback((edgeId: string) => {
    setHoveredEdgeId((currentEdgeId) =>
      currentEdgeId === edgeId ? null : currentEdgeId
    );
  }, []);

  const selectEdge = useCallback((edgeId: string) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(edgeId);
    setDrawerVisible(false);
  }, []);

  const onNodeContextMenu = useCallback((event: any, node: any) => {
    event.preventDefault();
    setSelectedNodeId(node.id);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setHoveredEdgeId(null);
    closeContextMenu();
  }, [closeContextMenu]);

  const deleteActiveEdge = useCallback(() => {
    const edgeId = hoveredEdgeId || selectedEdgeId;

    if (!edgeId) return;

    const targetEdge = getEdges().find((edge) => edge.id === edgeId);

    if (!targetEdge) {
      setHoveredEdgeId(null);
      setSelectedEdgeId(null);
      return;
    }

    pushHistory();
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setHoveredEdgeId(null);
    setSelectedEdgeId(null);
    setDrawerVisible(false);
  }, [getEdges, hoveredEdgeId, pushHistory, selectedEdgeId, setEdges]);

  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  const onSelectionContextMenu = useCallback((event: any, { nodes }: any) => {
    if (nodes.length > 0) {
      event.preventDefault();
      setSelectedNodes(nodes);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setMenuVisible(true);
    }
  }, []);

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case "left":
        return "入";
      case "right":
        return "出";
      case "both":
        return "连";
      default:
        return "";
    }
  };

  const deleteConnections = useCallback(
    (direction: string, nodesArg?: any[]) => {
      const nodesToProcess =
        nodesArg || (selectedNode ? [selectedNode] : selectedNodes);

      if (!nodesToProcess || nodesToProcess.length === 0) {
        message.warning("请先选择节点");
        return;
      }

      const nodeIds = nodesToProcess.map((node) => node.id);
      const currentEdges = getEdges();
      let edgesToDelete: any[] = [];

      if (direction === "left") {
        edgesToDelete = currentEdges.filter((edge) =>
          nodeIds.includes(edge.target)
        );
      } else if (direction === "right") {
        edgesToDelete = currentEdges.filter((edge) =>
          nodeIds.includes(edge.source)
        );
      } else if (direction === "both") {
        edgesToDelete = currentEdges.filter(
          (edge) =>
            nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
        );
      }

      if (edgesToDelete.length === 0) {
        message.warning(`选中的节点没有${getDirectionText(direction)}边`);
        return;
      }

      const edgeIdsToDelete = new Set(edgesToDelete.map((edge) => edge.id));

      pushHistory();
      message.success(
        `已删除 ${edgesToDelete.length} 条${getDirectionText(direction)}边`
      );
      setEdges((eds) => eds.filter((edge) => !edgeIdsToDelete.has(edge.id)));

      setDrawerVisible(false);
    },
    [getEdges, pushHistory, selectedNode, selectedNodes, setEdges]
  );

  const handleContextMenuAction = ({ key }: any, node?: any) => {
    const nodesToDelete = node ? [node] : selectedNodes;

    switch (key) {
      case "delete":
        pushHistory();
        setNodes((nds) =>
          nds.filter((n) => !nodesToDelete.some((sn: any) => sn.id === n.id))
        );
        setEdges((eds) =>
          eds.filter(
            (e) =>
              !nodesToDelete.some(
                (n: any) => e.source === n.id || e.target === n.id
              )
          )
        );
        message.success(`已删除 ${nodesToDelete.length} 个节点`);
        setDrawerVisible(false);
        break;
      case "delete_left_connections":
        deleteConnections("left", nodesToDelete);
        break;
      case "delete_right_connections":
        deleteConnections("right", nodesToDelete);
        break;
      case "delete_all_connections":
        deleteConnections("both", nodesToDelete);
        break;
      default:
        break;
    }

    closeContextMenu();
  };

  const renderContextMenu = () => {
    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : selectedNode
        ? [selectedNode]
        : [];

    const hasLeftConnections = edges.some((edge) =>
      targetNodes.some((node) => edge.target === node.id)
    );
    const hasRightConnections = edges.some((edge) =>
      targetNodes.some((node) => edge.source === node.id)
    );
    const hasAnyConnections = hasLeftConnections || hasRightConnections;

    const items: any[] = [];

    if (hasLeftConnections || hasRightConnections) {
      // items.push({ type: "divider" });
    }

    if (hasLeftConnections) {
      items.push({
        key: "delete_left_connections",
        label: `删除入边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasRightConnections) {
      items.push({
        key: "delete_right_connections",
        label: `删除出边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasAnyConnections) {
      items.push({
        key: "delete_all_connections",
        label: `删除所有连接${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
        danger: true,
      });
    }

    if (hasLeftConnections || hasRightConnections) {
      items.push({ type: "divider" });
    }
    items.push({
      key: "delete",
      label: `删除节点${
        targetNodes.length > 1 ? `(${targetNodes.length})` : ""
      }`,
      danger: true,
    });

    return (
      <Menu
        onClick={(e) => handleContextMenuAction(e, selectedNode)}
        items={items}
      />
    );
  };

  const onCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setSelectedNodeId(null);
  }, []);

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              config: {
                ...(node.data?.config || {}),
                ...(newData?.config || {}),
              },
              meta: {
                ...(node.data?.meta || {}),
                ...(newData?.meta || {}),
              },
            },
          };
        })
      );
    },
    [setNodes]
  );

  const getDirectUpstreamNode = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes();

      const incomingEdge = currentEdges.find((edge) => edge.target === nodeId);
      if (!incomingEdge) return null;

      return (
        currentNodes.find((node) => node.id === incomingEdge.source) || null
      );
    },
    [getEdges, getNodes]
  );

  const getDirectUpstreamSchema = useCallback(
    (nodeId: string) => {
      const upstreamNode = getDirectUpstreamNode(nodeId);
      console.log(upstreamNode?.data?.meta?.outputSchema);
      return upstreamNode?.data?.meta?.outputSchema || [];
    },
    [getDirectUpstreamNode]
  );

  const getDirectDownstreamNodes = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes();

      const targetIds = currentEdges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      return currentNodes.filter((node) => targetIds.includes(node.id));
    },
    [getEdges, getNodes]
  );

  const buildFieldMapperOutputSchema = (
    inputSchema: any[] = [],
    mappings: any[] = [],
    passThroughUnmapped = false
  ) => {
    const mappedFields = mappings
      .filter(
        (item) => item.enabled !== false && item.sourceField && item.targetField
      )
      .map((item) => {
        const sourceField = inputSchema.find(
          (f) => f.name === item.sourceField
        );

        return {
          name: item.targetField,
          type: item.targetType || sourceField?.type,
          nullable: sourceField?.nullable,
          comment: sourceField?.comment,
          originFieldName: item.sourceField,
        };
      });

    if (!passThroughUnmapped) {
      return mappedFields;
    }

    const mappedSourceNames = new Set(
      mappings
        .filter((item) => item.enabled !== false)
        .map((item) => item.sourceField)
    );

    const passthroughFields = inputSchema
      .filter((field) => !mappedSourceNames.has(field.name))
      .map((field) => ({
        ...field,
        originFieldName: field.name,
      }));

    return [...mappedFields, ...passthroughFields];
  };

  const refreshNodeSchema = useCallback(
    (nodeId: string) => {
      const currentNodes = getNodes();
      const node = currentNodes.find((item) => item.id === nodeId);
      if (!node) return;

      if (node.data?.nodeType === "transform") {
        const inputSchema = getDirectUpstreamSchema(nodeId);

        if (node.data?.componentType === "FIELDMAPPER") {
          const mappings = node.data?.config?.mappings || [];
          const passThroughUnmapped =
            node.data?.config?.passThroughUnmapped ?? true;

          const outputSchema = buildFieldMapperOutputSchema(
            inputSchema,
            mappings,
            passThroughUnmapped
          );

          handleNodeDataChange(nodeId, {
            meta: {
              inputSchema,
              outputSchema,
              schemaStatus: "success",
              schemaError: "",
            },
          });
        }

        if (node.data?.componentType === "SQL") {
          handleNodeDataChange(nodeId, {
            meta: {
              inputSchema,
              outputSchema: inputSchema, // 先占位，后面再接 SQL 解析
              schemaStatus: "success",
              schemaError: "",
            },
          });
        }
      }

      if (node.data?.nodeType === "sink") {
        const inputSchema = getDirectUpstreamSchema(nodeId);

        handleNodeDataChange(nodeId, {
          meta: {
            inputSchema,
            schemaStatus: "success",
            schemaError: "",
          },
        });
      }
    },
    [getNodes, getDirectUpstreamSchema, handleNodeDataChange]
  );

  const refreshDownstreamSchemas = useCallback(
    (nodeId: string) => {
      const downstreamNodes = getDirectDownstreamNodes(nodeId);

      downstreamNodes.forEach((node) => {
        refreshNodeSchema(node.id);
      });
    },
    [getDirectDownstreamNodes, refreshNodeSchema]
  );

  const getFieldMapperLinkedNodeIds = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes();

      const incomingEdge = currentEdges.find((edge) => edge.target === nodeId);
      const outgoingEdge = currentEdges.find((edge) => edge.source === nodeId);

      const upstreamNode = incomingEdge
        ? currentNodes.find((node) => node.id === incomingEdge.source)
        : null;

      console.log(upstreamNode);

      const downstreamNode = outgoingEdge
        ? currentNodes.find((node) => node.id === outgoingEdge.target)
        : null;
      console.log(downstreamNode);
      return {
        sourceNodeId: upstreamNode?.id,
        sinkNodeId: downstreamNode?.id,
      };
    },
    [getEdges, getNodes]
  );

  const syncTransformPluginConfig = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();

      const incomingEdge = currentEdges.find((edge) => edge.target === nodeId);
      const outgoingEdge = currentEdges.find((edge) => edge.source === nodeId);

      const pluginInput = incomingEdge?.source;
      const pluginOutput = outgoingEdge?.target;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...(node.data?.config || {}),
                pluginInput,
                pluginOutput,
              },
            },
          };
        })
      );

      return {
        pluginInput,
        pluginOutput,
      };
    },
    [getEdges, getNodes, setNodes]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    controlMode,
    setControlMode,
    toggleControlMode,
    nodesReadOnly,
    workflowReadOnly,
    interactionMode,
    runVisible,
    setRunVisible,
    drawerVisible,
    selectedNode,
    selectedEdgeId,
    menuVisible,
    menuPosition,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onEdgeMouseEnter,
    onEdgeMouseLeave,
    selectEdge,
    deleteActiveEdge,
    canDeleteEdge: Boolean(hoveredEdgeId || selectedEdgeId),
    onNodeContextMenu,
    onPaneClick,
    onSelectionChange,
    onSelectionContextMenu,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneContextMenu,
    isValidConnection,
    closeContextMenu,
    renderContextMenu,
    onCloseDrawer,
    handleNodeDataChange,
    screenToFlowPosition,
    addNode,
    insertNodeOnEdge,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    autoLayout,
    fitWorkflowView,
    getDirectUpstreamNode,
    getDirectUpstreamSchema,
    getDirectDownstreamNodes,
    refreshNodeSchema,
    refreshDownstreamSchemas,
    getFieldMapperLinkedNodeIds,
    syncTransformPluginConfig,
  };
}
