export const ALL_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const STANDARD_TIMESLOTS = [
  "0800",
  "0900",
  "1000",
  "1100",
  "1200",
  "1300",
  "1400",
  "1500",
  "1600",
  "1700",
  "1800",
];

export const TIME_FORMAT_OPTIONS = [
  { value: "HHMM", label: "2300" },
  { value: "HH:MM", label: "23:00" },
  { value: "HH.MM", label: "23.00" },
  { value: "h AM/PM", label: "11 PM" },
  { value: "h:mm AM/PM", label: "11:00 PM" },
  { value: "h.mm AM/PM", label: "11.00 PM" },
];
export const DAY_FORMAT_OPTIONS = [
  { value: "FullFirstCaps", label: "Monday" },
  { value: "FullUpper", label: "MONDAY" },
  { value: "ShortFirstCaps", label: "Mon" },
  { value: "ShortUpper", label: "MON" },
];

export const TIMETABLE_DISPLAY_OPTIONS = [
  { value: "expand", label: "Expand" },
  { value: "collapse", label: "Collapse" },
];

export const TEXT_SIZE_OPTIONS = {
  min: 8,
  max: 18,
  step: 1,
  default: 12,
};

export const SCHEDULE_PAGE_SIZE = 5;
export const MAX_DATASETS = 10;

export const DEFAULT_DATASET_NAME = "Example";
export const DEFAULT_DATASET_FILENAME = "/example.xlsx";