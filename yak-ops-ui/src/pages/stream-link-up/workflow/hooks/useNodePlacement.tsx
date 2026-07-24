import { useCallback, useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import { ControlMode } from "../config";

interface Props {
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setControlMode: (mode: string) => void;
}

export default function useNodePlacement({
  setNodes,
  setControlMode,
}: Props) {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [draggingNode, setDraggingNode] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlacingNode, setIsPlacingNode] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingNode || !reactFlowWrapper.current) return;

      const flowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: e.clientX - flowBounds.left,
        y: e.clientY - flowBounds.top,
      });

      setMousePosition(position);

      setNodes((nds) =>
        nds.map((node) =>
          node.id === draggingNode.id ? { ...node, position } : node
        )
      );
    },
    [draggingNode, reactFlowInstance, setNodes]
  );

  const cleanupDragging = useCallback(() => {
    setDraggingNode(null);
    setIsPlacingNode(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("click", handleCanvasClick);
  }, [handleMouseMove]);

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (!draggingNode || !isPlacingNode) return;

      if (e.target && (e.target as HTMLElement).closest(".react-flow__node")) {
        return;
      }

      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: "custom",
        position: mousePosition,
        data: { ...draggingNode.data, isPreview: false },
        draggable: true,
        selectable: true,
      };

      setNodes((nds) => {
        const filteredNodes = nds.filter((node) => node.id !== draggingNode.id);
        return [...filteredNodes, newNode];
      });

      cleanupDragging();
    },
    [draggingNode, isPlacingNode, mousePosition, setNodes, cleanupDragging]
  );

  const handleNodeDragStart = useCallback(
    (id: any, nodeData: any) => {
      const previewNode = {
        id,
        type: "custom",
        position: { x: mousePosition.x, y: mousePosition.y },
        data: { ...nodeData, isPreview: true, type: "source" },
        draggable: true,
        selectable: true,
      };

      setDraggingNode(previewNode);
      setIsPlacingNode(true);
      setControlMode(ControlMode.Pointer);
      setNodes((nds) => [...nds, previewNode]);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleCanvasClick);
    },
    [mousePosition, setControlMode, setNodes, handleMouseMove, handleCanvasClick]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlacingNode) {
        setNodes((nds) => nds.filter((node) => node.id !== draggingNode?.id));
        cleanupDragging();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlacingNode, draggingNode, setNodes, cleanupDragging]);

  useEffect(() => {
    document.body.style.cursor = isPlacingNode ? "crosshair" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [isPlacingNode]);

  return {
    reactFlowWrapper,
    handleNodeDragStart,
  };
}