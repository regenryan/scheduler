export function formatTime(timeStr, timeFormatSetting = "HH:MM") {
  if (!/^\d{4}$/.test(timeStr)) return timeStr;

  const h = parseInt(timeStr.substring(0, 2), 10);
  const m = timeStr.substring(2, 4);

  switch (timeFormatSetting) {
    case "HHMM":
      return `${String(h).padStart(2, "0")}${m}`;
    case "HH:MM":
      return `${String(h).padStart(2, "0")}:${m}`;
    case "HH.MM":
      return `${String(h).padStart(2, "0")}.${m}`;
    case "h AM/PM": {
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${h12} ${ampm}`;
    }
    case "h:mm AM/PM": {
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${h12}:${m} ${ampm}`;
    }
    case "h.mm AM/PM": {
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${h12}.${m} ${ampm}`;
    }
    default:
      return `${String(h).padStart(2, "0")}:${m}`;
  }
}

export function formatDayName(dayStr, dayFormatSetting = "FullFirstCaps") {
  if (!dayStr || typeof dayStr !== "string") return dayStr;

  const lowerDay = dayStr.toLowerCase();
  switch (dayFormatSetting) {
    case "FullUpper":
      return dayStr.toUpperCase();
    case "ShortFirstCaps":
      if (dayStr.length < 3)
        return dayStr.charAt(0).toUpperCase() + dayStr.slice(1).toLowerCase();
      return (
        dayStr.substring(0, 1).toUpperCase() +
        dayStr.substring(1, 3).toLowerCase()
      );
    case "ShortUpper":
      if (dayStr.length < 3) return dayStr.toUpperCase();
      return dayStr.substring(0, 3).toUpperCase();
    case "FullFirstCaps":
    default:
      return dayStr.charAt(0).toUpperCase() + dayStr.slice(1).toLowerCase();
  }
}
