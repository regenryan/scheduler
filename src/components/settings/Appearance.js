import React from "react";
import RadioGroup from "./RadioGroup";
import AppearanceOptionBlock from "./AppearanceOptionBlock";
import {
  ALL_WEEKDAYS,
  STANDARD_TIMESLOTS,
  TIME_FORMAT_OPTIONS,
  DAY_FORMAT_OPTIONS,
  TEXT_SIZE_OPTIONS,
} from "../../services/config";
import { formatDayName, formatTime } from "../../utils/format";

const CheckboxItem = ({ type, value, displayValue, isChecked, onChange }) => {
  const id = `${type}-${value}`;
  return (
    <label
      key={id}
      htmlFor={id}
      className="flex items-center p-1 rounded-md hover:bg-gray-100 text-sm text-gray-800 cursor-pointer select-none whitespace-nowrap transition-colors duration-150"
    >
      <input
        type="checkbox"
        id={id}
        className="custom-checkbox visibility-checkbox mr-2 h-4 w-4 rounded border-gray-300 text-theme-primary-bg focus:outline-none focus:ring-2 focus:ring-offset-1 ring-theme-primary-ring"
        data-type={type}
        data-value={value}
        checked={isChecked}
        onChange={(e) => onChange(type, value, e.target.checked)}
      />
      <span>{displayValue}</span>
    </label>
  );
};

const NumberInput = ({ label, min, max, step, value, onChange, name }) => (
  <div>
    <div className="flex items-center">
      <input
        type="range"
        id={name}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="themed-range w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ring-theme-primary-ring"
        style={{ accentColor: "var(--theme-range-color)" }}
      />
      <span className="text-xs text-gray-600 ml-3 w-8 text-right">
        {value}px
      </span>
    </div>
  </div>
);

function Appearance({ appearanceSettings = {}, onAppearanceChange }) {
  const {
    timeFormat = "HH:MM",
    dayFormat = "FullFirstCaps",
    textSize = TEXT_SIZE_OPTIONS.default,
    visibleDays = new Set(ALL_WEEKDAYS),
    visibleTimes = new Set(STANDARD_TIMESLOTS),
    timetableDisplay = "expand",
  } = appearanceSettings;

  const handleSettingChange = (settingName, value) => {
    let processedValue = value;
    if (settingName === "textSize") {
      processedValue = parseInt(value, 10);
    }
    onAppearanceChange({ [settingName]: processedValue });
  };

  const handleVisibilityCheckboxChange = (type, value, isChecked) => {
    if (type === "day") {
      const newVisibleDays = new Set(visibleDays);
      if (isChecked) newVisibleDays.add(value);
      else newVisibleDays.delete(value);
      onAppearanceChange({ visibleDays: newVisibleDays });
    } else if (type === "time") {
      const newVisibleTimes = new Set(visibleTimes);
      if (isChecked) newVisibleTimes.add(value);
      else newVisibleTimes.delete(value);
      onAppearanceChange({ visibleTimes: newVisibleTimes });
    }
  };

  return (
    <div className="space-y-3">
      <AppearanceOptionBlock title="Show Days">
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {ALL_WEEKDAYS.map((day) => (
            <CheckboxItem
              key={`day-${day}`}
              type="day"
              value={day}
              displayValue={formatDayName(day, dayFormat)}
              isChecked={visibleDays?.has(day)}
              onChange={handleVisibilityCheckboxChange}
            />
          ))}
        </div>
      </AppearanceOptionBlock>

      <AppearanceOptionBlock title="Show Times">
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {STANDARD_TIMESLOTS.map((time) => (
            <CheckboxItem
              key={`time-${time}`}
              type="time"
              value={time}
              displayValue={formatTime(time, timeFormat)}
              isChecked={visibleTimes?.has(time)}
              onChange={handleVisibilityCheckboxChange}
            />
          ))}
        </div>
      </AppearanceOptionBlock>

      <AppearanceOptionBlock title="Time Format">
        <RadioGroup
          name="timeFormat"
          options={TIME_FORMAT_OPTIONS}
          currentValue={timeFormat}
          onChange={(value) => handleSettingChange("timeFormat", value)}
        />
      </AppearanceOptionBlock>

      <AppearanceOptionBlock title="Day Format">
        <RadioGroup
          name="dayFormat"
          options={DAY_FORMAT_OPTIONS}
          currentValue={dayFormat}
          onChange={(value) => handleSettingChange("dayFormat", value)}
        />
      </AppearanceOptionBlock>

      <AppearanceOptionBlock title="Text Size">
        <NumberInput
          name="textSize"
          min={TEXT_SIZE_OPTIONS.min}
          max={TEXT_SIZE_OPTIONS.max}
          step={TEXT_SIZE_OPTIONS.step}
          value={textSize}
          onChange={(value) => handleSettingChange("textSize", value)}
        />
      </AppearanceOptionBlock>

      <AppearanceOptionBlock title="Card State">
        <RadioGroup
          name="timetableDisplay"
          options={[
            { value: "expand", label: "Expand" },
            { value: "collapse", label: "Collapse" },
          ]}
          currentValue={timetableDisplay}
          onChange={(value) => handleSettingChange("timetableDisplay", value)}
        />
      </AppearanceOptionBlock>
    </div>
  );
}

export default Appearance;
