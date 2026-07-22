import React from "react";

export type StreamStatus = "RUNNING" | "WARNING" | "PAUSED" | "STOPPED";

export interface RealtimeTask {
  id: string;
  name: string;
  sourceType: string;
  sourceLabel: string;
  sinkType: string;
  sinkLabel: string;
  status: StreamStatus;
  throughput?: string;
  latency?: string;
  checkpoint: string[];
  updateTime: string;
  trendType?: "blue" | "green" | "orange" | "gray";
}

export interface HelperCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "purple" | "blue" | "green";
}