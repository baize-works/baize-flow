// components/ControlButtons.tsx
import { Popover, Tooltip } from "antd";
import React from "react";
import { ControlMode } from "../config";
import HandIcon from "../icon/HandIcon";
import PlusNodeIcon from "../icon/PlusNodeIcon";
import PointerIcon from "../icon/PointerIcon";
import "./index.less";
import { NodeListPopover } from "./NodeListPopover";

interface ControlButtonsProps {
  controlMode: string;
  onControlModeChange?: (mode: string) => void;
  onNodeDragStart?: (id: any, nodeData: any) => void;
  searchText: string;
  onSearchChange: (e: any) => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  controlMode,
  onControlModeChange,
  onNodeDragStart,
  searchText,
  onSearchChange,
}) => {
  const handlePointerMode = () => {
    onControlModeChange?.(ControlMode.Pointer);
  };

  const handleHandMode = () => {
    onControlModeChange?.(ControlMode.Hand);
  };

  return (
    <div
      style={{
        width: "40px",
        borderRadius: "8px",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
        // borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#DCE3EC",
        padding: "4px 0 4px 0",
        boxShadow: "0 0 0 2px rgba(41, 109, 255, 0.12)",
      }}
      className="shadow-lg"
    >
      <div>
        <Tooltip title="Add Node">
          <Popover
            placement="right"
            content={
              <NodeListPopover
                onNodeDragStart={onNodeDragStart}
                searchText={searchText}
                onSearchChange={onSearchChange}
              />
            }
            trigger="click"
          >
            <div data-state="closed">
              <div
                className="base-hover flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover hover:text-text-secondary false"
                style={{
                  height: 32,
                  width: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                data-state="closed"
              >
                <PlusNodeIcon />
              </div>
            </div>
          </Popover>
        </Tooltip>

        <Divider />

        <Tooltip title="Pointer Mode">
          <div data-state="closed">
            <div
              className={`base-hover flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-state-base-hover hover:text-text-secondary ${
                controlMode === ControlMode.Pointer
                  ? "bg-state-base-active text-text-secondary"
                  : "text-text-tertiary"
              }`}
              style={{
                height: 32,
                width: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handlePointerMode}
              data-state="closed"
            >
              <PointerIcon />
            </div>
          </div>
        </Tooltip>

        <Divider />

        <Tooltip title="Hand Mode">
          <div data-state="closed">
            <div
              className={`base-hover flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-state-base-hover hover:text-text-secondary ${
                controlMode === ControlMode.Hand
                  ? "bg-state-base-active text-text-secondary"
                  : "text-text-tertiary"
              }`}
              style={{
                height: 32,
                width: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleHandMode}
              data-state="closed"
            >
              <HandIcon />
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

const Divider = () => (
  <div
    style={{
      backgroundColor: "rgb(16 24 40/0.08)",
      width: "0.875rem",
      height: "0.5px",
      flexShrink: 0,
      marginTop: ".25rem",
      marginBottom: ".25rem",
      marginLeft: 9,
    }}
  ></div>
);
