export type ScheduleType = "hour" | "day" | "week";
export type HourMode = "range" | "appoint";
export type EffectType = "forever" | "assign";

export interface HourlyRangeModeValue {
  startTime: string;
  intervalHour: number;
  endTime: string;
}

export interface HourlyAppointModeValue {
  hours: number[];
  minute: string;
}

export interface DailyModeValue {
  time: string;
}

export interface WeeklyModeValue {
  weekdays: string[];
  time: string;
}

export interface ScheduleTimeValue {
  scheduleType?: ScheduleType;
  hourMode?: HourMode;
  hourlyRangeValue?: HourlyRangeModeValue;
  hourlyAppointValue?: HourlyAppointModeValue;
  dailyValue?: DailyModeValue;
  weeklyValue?: WeeklyModeValue;
  effectType?: EffectType;
  effectStartTime?: string;
  effectEndTime?: string;
  cronExpression?: string;
}

export interface ScheduleTimeSectionProps {
  value?: ScheduleTimeValue;
  onChange?: (patch: Partial<ScheduleTimeValue>) => void;
}