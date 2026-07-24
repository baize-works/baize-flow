import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";

interface SourceNodeData {
  title?: string;
  dbType?: string;
  description?: string;
}

const SourceNode: FC<NodeProps<SourceNodeData>> = ({ data, selected }) => {
  const [hovered, setHovered] = useState(false);

  const displayTitle = useMemo(() => {
    return data?.title || "输入端";
  }, [data?.title]);

  const displayDesc = useMemo(() => {
    return data?.description || "读取源端数据";
  }, [data?.description]);

  const handleStyle = (side: "left" | "right") => {
    const size = hovered ? 16 : 10;
    const offset = hovered ? -10 : -6;

    return {
      width: size,
      height: size,
      top: "50%",
      transform: "translateY(-50%)",
      background: "#315EFB",
      border: "3px solid #fff",
      boxShadow: hovered ? "0 0 0 4px rgba(49, 94, 251, 0.16)" : "none",
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
          color: "#6B7FD7",
        }}
      >
        Source
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 18,
          border: selected ? "1px solid #C7D7FE" : "1px solid #D8DEE8",
          boxShadow: selected
            ? "0 10px 24px rgba(49, 94, 251, 0.10), 0 0 0 4px rgba(49, 94, 251, 0.10)"
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
              background: "linear-gradient(180deg, #EEF3FF 0%, #E3EBFF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid rgba(49, 94, 251, 0.08)",
            }}
          >
            <DatabaseIcons dbType={data?.dbType || "mysql"} width="18" height="18" />
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

export default React.memo(SourceNode);