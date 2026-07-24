import type {
  DailyModeValue,
  HourlyAppointModeValue,
  HourlyRangeModeValue,
  HourMode,
  ScheduleType,
  WeeklyModeValue,
} from "./types";

export const parseTime = (value?: string) => {
  const safeValue = value || "00:00";
  const [hourStr = "00", minuteStr = "00"] = safeValue.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  return {
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
};

export const pad = (num: number) => String(num).padStart(2, "0");

export const normalizeTime = (value?: string) => {
  const { hour, minute } = parseTime(value);
  const safeHour = Math.min(23, Math.max(0, hour));
  const safeMinute = Math.min(59, Math.max(0, minute));
  return `${pad(safeHour)}:${pad(safeMinute)}`;
};

export const normalizeMinute = (value?: string) => {
  const minute = Number(value ?? "0");
  const safeMinute = Number.isNaN(minute)
    ? 0
    : Math.min(59, Math.max(0, minute));
  return pad(safeMinute);
};

export const weekdayToCron = (days: string[]) => {
  if (!days?.length) return "?";

  const mapping: Record<string, string> = {
    MON: "2",
    TUE: "3",
    WED: "4",
    THU: "5",
    FRI: "6",
    SAT: "7",
    SUN: "1",
  };

  return days.map((day) => mapping[day]).join(",");
};

export const buildCron = (
  scheduleType: ScheduleType,
  hourMode: HourMode,
  hourlyRange: HourlyRangeModeValue,
  hourlyAppoint: HourlyAppointModeValue,
  daily: DailyModeValue,
  weekly: WeeklyModeValue
) => {
  if (scheduleType === "hour") {
    if (hourMode === "range") {
      const { minute } = parseTime(hourlyRange.startTime);
      const { hour: startHour } = parseTime(hourlyRange.startTime);
      const { hour: endHour } = parseTime(hourlyRange.endTime);
      const interval = hourlyRange.intervalHour || 1;

      return `0 ${minute} ${startHour}-${endHour}/${interval} * * ?`;
    }

    const minute = Number(hourlyAppoint.minute || "0");
    const hourCron = (hourlyAppoint.hours || []).length
      ? [...hourlyAppoint.hours].sort((a, b) => a - b).join(",")
      : "*";

    return `0 ${minute} ${hourCron} * * ?`;
  }

  if (scheduleType === "day") {
    const { hour, minute } = parseTime(daily.time);
    return `0 ${minute} ${hour} * * ?`;
  }

  const { hour, minute } = parseTime(weekly.time);
  const dayOfWeek = weekdayToCron(weekly.weekdays);

  return `0 ${minute} ${hour} ? * ${dayOfWeek}`;
};

export const defaultHourlyRangeValue = {
  startTime: "00:00",
  intervalHour: 1,
  endTime: "23:59",
};

export const defaultHourlyAppointValue = {
  hours: [0],
  minute: "00",
};

export const defaultDailyValue = {
  time: "00:17",
};

export const defaultWeeklyValue = {
  weekdays: ["MON"],
  time: "00:17",
};