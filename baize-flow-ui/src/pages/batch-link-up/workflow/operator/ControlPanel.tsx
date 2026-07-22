import React, { useState } from "react";
import { Panel } from "reactflow";
import { ControlMode } from "../config";
import { ControlButtons } from "./ControlButtons";
import { FlowActions } from "./FlowActions";
import "./index.less";
import { SaveInfo } from "./SaveInfo";

interface ControlPanelProps {
  controlMode?: string;
  onControlModeChange?: (mode: string) => void;
  onNodeDragStart?: (id:any, nodeData: any) => void;
  nodes: any[];
  edges: any[];
  baseForm: any;
  goBack: (value: any) => void;
  setRunVisible: (value: any) => void;
  runVisible: any;
}
export const ControlPanel: React.FC<ControlPanelProps> = ({
  controlMode = ControlMode.Hand,
  onControlModeChange,
  onNodeDragStart,
  nodes,
  edges,
  baseForm,
  goBack,
  setRunVisible,
  runVisible
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e: any) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <Panel
        position="top-left"
        style={{
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ControlButtons
          controlMode={controlMode}
          onControlModeChange={onControlModeChange}
          onNodeDragStart={onNodeDragStart}
          searchText={searchText}
          onSearchChange={handleSearch}
        />
      </Panel>

      <Panel position="top-left">
        <SaveInfo />
      </Panel>

      <Panel position="top-right">
        <FlowActions
          nodes={nodes}
          edges={edges}
          baseForm={baseForm}
          goBack={goBack}
          setRunVisible={setRunVisible}
          runVisible={runVisible}
        />
      </Panel>
    </>
  );
};
