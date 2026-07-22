import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Braces, Database } from "lucide-react";

interface TransformNodeData {
  title?: string;
  label?: string;
  nodeType?: string;
  componentType?: string;
  iconType?: string;
  description?: string;
}

const componentTypeTextMap: Record<string, string> = {
  FIELDMAPPER: "字段映射",
  SQL: "SQL 脚本",
};

const componentDescMap: Record<string, string> = {
  FIELDMAPPER: "配置字段对应关系",
  SQL: "支持自定义查询逻辑",
};

const themeMap: Record<
  string,
  {
    dot: string;
    dotShadow: string;
    iconColor: string;
    iconBg: string;
    selectedBorder: string;
    selectedGlow: string;
    labelColor: string;
  }
> = {
  FIELDMAPPER: {
    dot: "#315EFB",
    dotShadow: "rgba(49, 94, 251, 0.16)",
    iconColor: "#315EFB",
    iconBg: "linear-gradient(180deg, #EEF3FF 0%, #E3EBFF 100%)",
    selectedBorder: "#C7D7FE",
    selectedGlow: "rgba(49, 94, 251, 0.10)",
    labelColor: "#6B7FD7",
  },
  SQL: {
    dot: "#7C3AED",
    dotShadow: "rgba(124, 58, 237, 0.16)",
    iconColor: "#7C3AED",
    iconBg: "linear-gradient(180deg, #F3E8FF 0%, #EDE0FF 100%)",
    selectedBorder: "#D9C2FF",
    selectedGlow: "rgba(124, 58, 237, 0.10)",
    labelColor: "#8A63D2",
  },
  DEFAULT: {
    dot: "#98A2B3",
    dotShadow: "rgba(152, 162, 179, 0.14)",
    iconColor: "#5B6B8A",
    iconBg: "#EEF2FF",
    selectedBorder: "#C7D7FE",
    selectedGlow: "rgba(80, 112, 255, 0.10)",
    labelColor: "#7B8AAA",
  },
};

const TransformNode: FC<NodeProps<TransformNodeData>> = ({ data, selected }) => {
  const [hovered, setHovered] = useState(false);

  const componentType = data?.componentType || "UNKNOWN";
  const iconType = data?.iconType || "braces";
  const theme = themeMap[componentType] || themeMap.DEFAULT;

  const displayTitle = useMemo(() => {
    return (
      data?.title ||
      data?.label ||
      componentTypeTextMap[componentType] ||
      "转换节点"
    );
  }, [data?.title, data?.label, componentType]);

  const displayDesc = useMemo(() => {
    return data?.description || componentDescMap[componentType] || "转换处理节点";
  }, [data?.description, componentType]);

  const iconNode = useMemo(() => {
    switch (iconType) {
      case "database":
        return <Database size={16} color={theme.iconColor} strokeWidth={2.2} />;
      case "braces":
      default:
        return <Braces size={16} color={theme.iconColor} strokeWidth={2.2} />;
    }
  }, [iconType, theme.iconColor]);

  const handleStyle = (side: "left" | "right") => {
    const size = hovered ? 16 : 10;
    const offset = hovered ? -10 : -6;

    return {
      width: size,
      height: size,
      top: "50%",
      transform: "translateY(-50%)",
      background: theme.dot,
      border: "3px solid #fff",
      boxShadow: hovered ? `0 0 0 4px ${theme.dotShadow}` : "none",
      transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
      opacity: hovered ? 1 : 0.92,
      [side]: offset,
    } as React.CSSProperties;
  };

  return (
    <div
      style={{
        position: "relative",
        minWidth: 220,
        padding: "2px 0",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          marginBottom: 6,
          paddingLeft: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: theme.labelColor,
        }}
      >
        Transform
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle("left")}
      />

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: selected
            ? `1px solid ${theme.selectedBorder}`
            : "1px solid #D8DEE8",
          boxShadow: selected
            ? `0 10px 24px ${theme.selectedGlow}, 0 0 0 4px ${theme.selectedGlow}`
            : "0 6px 16px rgba(15, 23, 42, 0.06)",
          padding: "14px 16px",
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: theme.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {iconNode}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                lineHeight: "22px",
                color: "#182230",
                marginBottom: 2,
              }}
            >
              {displayTitle}
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: "18px",
                color: "#8A94A6",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayDesc}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle("right")}
      />
    </div>
  );
};

export default React.memo(TransformNode);