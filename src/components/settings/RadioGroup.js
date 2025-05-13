import React from "react";

function RadioGroup({ name, options, currentValue, onChange, columns = 1 }) {
  const gridColsClass = `grid-cols-${columns}`;

  return (
    <fieldset className={`grid ${gridColsClass} gap-2`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`custom-radio-label flex items-center text-sm text-gray-800 cursor-pointer select-none p-0.5 rounded-md border border-transparent hover:bg-gray-100 transition-colors duration-150
            ${
              currentValue === opt.value
                ? "/* Selected state styling now primarily on inner span */"
                : ""
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={currentValue === opt.value}
            className="sr-only"
            onChange={(e) => onChange(e.target.value)}
            aria-labelledby={`${name}-${opt.value}-label`}
          />
          <span
            id={`${name}-${opt.value}-label`}
            className={`custom-radio-button px-2 py-1 border rounded-md text-center w-full text-xs whitespace-nowrap
              ${currentValue === opt.value ? "selected" : ""}
            `}
          >
            {opt.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export default RadioGroup;
