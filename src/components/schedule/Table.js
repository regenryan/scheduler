import React from "react";
import { formatTime, formatDayName } from "../../utils/format";
import { ALL_WEEKDAYS, STANDARD_TIMESLOTS } from "../../services/config";

function ScheduleTable({ schedule = [], appearanceSettings = {} }) {
  const {
    timeFormat = "HH:MM",
    dayFormat = "FullFirstCaps",
    visibleDays = new Set(ALL_WEEKDAYS),
    visibleTimes = new Set(STANDARD_TIMESLOTS),
  } = appearanceSettings;

  const filteredTimeSlots = STANDARD_TIMESLOTS.filter((time) =>
    visibleTimes.has(time)
  );
  const filteredWeekdays = ALL_WEEKDAYS.filter((day) => visibleDays.has(day));

  const scheduleMap = React.useMemo(() => {
    const map = new Map();
    schedule.forEach(({ course, section, slots }) => {
      slots.forEach((slot) => {
        const key = `${slot.day}-${slot.time}`;

        const entry = {
          course: String(course || ""),
          section: String(section || ""),
          day: String(slot.day || ""),
          time: String(slot.time || ""),
          type: String(slot.type || "N/A"),
          location: String(slot.location || "N/A"),
          lecturer: String(slot.lecturer || "N/A"),
        };
        const existing = map.get(key) || [];
        map.set(key, [...existing, entry]);
      });
    });
    return map;
  }, [schedule]);

  const timeHeaderDisplayFormat = formatDayName("Time", dayFormat);

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="time-header-cell"> {timeHeaderDisplayFormat}</th>
            {filteredWeekdays.map((day) => (
              <th key={day} className="day-header-cell">
                {formatDayName(day, dayFormat)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredTimeSlots.map((time) => (
            <tr
              key={time}
              className="border-t border-[var(--theme-table-border)]"
            >
              <td className="time-cell">{formatTime(time, timeFormat)}</td>
              {filteredWeekdays.map((day) => {
                const entries = scheduleMap.get(`${day}-${time}`) || [];
                return (
                  <td key={`${day}-${time}`} className="schedule-data-cell">
                    {entries.length > 0 ? (
                      <div className="space-y-1">
                        {entries.map((entry, index) => (
                          <div key={index} className="schedule-entry">
                            <div className="entry-course">
                              {entry.course}-{entry.section}
                            </div>
                            <div className="entry-detail">{entry.type}</div>
                            <div className="entry-detail">{entry.location}</div>
                            <div className="entry-detail">{entry.lecturer}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleTable;
