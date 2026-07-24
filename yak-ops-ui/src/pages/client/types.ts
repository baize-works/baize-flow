export type HealthLevel = "healthy" | "warning" | "critical";

export type ClientMonitoring = {
  id: string;
  name: string;
  engineType: string;
  region: string;
  version: string;
  commit: string;
  statusText: string;
  overview: {
    projectVersion: string;
    gitCommitAbbrev: string;
    totalSlot: number;
    unassignedSlot: number;
    works: number;
    runningJobs: number;
    pendingJobs: number;
    finishedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
  };
  monitoring: {
    processors: number;
    physicalMemoryTotal: string;
    physicalMemoryFree: string;
    physicalMemoryFreeMB: number;
    swapSpaceTotal: string;
    swapSpaceFree: string;
    heapMemoryUsed: string;
    heapMemoryTotal: string;
    heapMemoryMax: string;
    heapMemoryUsedTotalPercent: number;
    heapMemoryUsedMaxPercent: number;
    minorGcCount: number;
    minorGcTime: string;
    majorGcCount: number;
    majorGcTime: string;
    loadProcessPercent: number;
    loadSystemPercent: number;
    loadSystemAverage: number;
    threadCount: number;
    threadPeakCount: number;
    clusterTimeDiff: number;
    eventQSize: number;
    proxyCount: number;
    clientEndpointCount: number;
    connectionActiveCount: number;
    clientConnectionCount: number;
    connectionCount: number;
  };
};

export type HealthInfo = {
  level: HealthLevel;
  title: string;
  subtitle: string;
  score: number;
  color: string;
};

export type TrendBar = {
  label: string;
  value: number;
  tip: string;
  gradient: string;
};

export type DistributionItem = {
  label: string;
  value: number;
  color: string;
};

export type RecentEventItem = {
  title: string;
  desc: string;
  time: string;
  color: string;
  shadow: string;
};

export type ResourceUsageTone = "blue" | "violet" | "amber" | "green" | "rose";

export type ResourceUsageItem = {
  key: string;
  label: string;
  subtitle: string;
  value: number;
  totalText: string;
  tip: string;
  tone: ResourceUsageTone;
  gradient: string;
  trackColor: string;
  glowColor: string;
  icon?: React.ReactNode;
};