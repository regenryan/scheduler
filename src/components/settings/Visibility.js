import React from "react";
import { ALL_WEEKDAYS, STANDARD_TIMESLOTS } from "../../services/config";
import { formatDayName, formatTime } from "../../utils/format";

function VisibilityCheckboxList({
  type,
  items,
  visibleItems,
  formatFunction,
  formatSetting,
  onCheckboxChange,
}) {
  const renderCheckbox = (value, displayValue) => {
    const isChecked = visibleItems?.has(value);
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
          className="custom-checkbox visibility-checkbox mr-2 h-4 w-4 rounded border-gray-300 text-theme-primary-bg focus:ring-theme-primary-ring"
          data-type={type}
          data-value={value}
          checked={!!isChecked}
          onChange={(e) => onCheckboxChange(type, value, e.target.checked)}
        />
        <span>{displayValue}</span>
      </label>
    );
  };

  return (
    <div className="space-y-1.5">
      {items.map((item) =>
        renderCheckbox(item, formatFunction(item, formatSetting))
      )}
    </div>
  );
}

export default function Visibility() {
  return null;
}
