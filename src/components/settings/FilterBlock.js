import React, { useState, useEffect, useMemo } from "react";

const ArrowDownIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

function FilterBlock({
  category,
  values = [],
  activeFilters = new Set(),
  onFilterChange,
  onSelectAll,
  title = category,
  disableSelectAll = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedValues = useMemo(
    () =>
      [...values].sort((a, b) => {
        return String(a).localeCompare(String(b), undefined, { numeric: true });
      }),
    [values]
  );

  const allChecked = useMemo(
    () =>
      sortedValues.length > 0 &&
      sortedValues.every((v) => activeFilters.has(v)),
    [sortedValues, activeFilters]
  );
  const someChecked = useMemo(
    () => sortedValues.some((v) => activeFilters.has(v)),
    [sortedValues, activeFilters]
  );
  const isIndeterminate = someChecked && !allChecked;

  const handleSelectAllChange = (event) => {
    onSelectAll({ category, checked: event.target.checked });
  };

  const handleItemChange = (event) => {
    onFilterChange({
      category,
      value: event.target.value,
      checked: event.target.checked,
    });
  };

  useEffect(() => {
    if (sortedValues.length === 0 && isOpen) {
      setIsOpen(false);
    }
  }, [sortedValues, isOpen]);

  return (
    <div className="filter-block">
      {" "}
      <div
        className={`flex items-center px-3 py-2 cursor-pointer rounded-t-md 
                    ${
                      isOpen
                        ? "border-b border-[var(--theme-app-border)]"
                        : "rounded-b-md"
                    }`}
        onClick={() => sortedValues.length > 0 && setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
        aria-disabled={sortedValues.length === 0}
      >
        <label className="flex items-center text-sm font-medium cursor-pointer select-none mr-2">
          <input
            type="checkbox"
            className="custom-checkbox select-all-for-category h-4 w-4 rounded text-theme-primary-bg focus:ring-theme-primary-ring disabled:opacity-50 disabled:cursor-not-allowed"
            data-category={category}
            checked={allChecked}
            ref={(el) => el && (el.indeterminate = isIndeterminate)}
            onChange={handleSelectAllChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select all ${title}`}
            disabled={sortedValues.length === 0 || disableSelectAll}
          />
        </label>
        <span className="text-sm font-medium capitalize flex-grow">
          {title}
        </span>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${sortedValues.length === 0 ? "opacity-50" : ""}`}
        >
          <ArrowDownIcon />
        </span>
      </div>
      {isOpen && (
        <div className="filter-checkbox-content max-h-48 overflow-y-auto">
          {sortedValues.length === 0 ? (
            <span className="text-xs italic px-1">
              No options available
              {category === "section" ? " (select courses first)" : ""}
            </span>
          ) : (
            sortedValues.map((val) => (
              <label
                key={val}
                className="flex items-center text-sm cursor-pointer select-none rounded px-1 py-0.5"
              >
                <input
                  type="checkbox"
                  className="custom-checkbox item-checkbox mr-2 h-4 w-4 rounded text-theme-primary-bg focus:ring-theme-primary-ring"
                  value={val}
                  checked={activeFilters.has(val)}
                  onChange={handleItemChange}
                  aria-label={val || "(Blank)"}
                />
                {val || "(Blank)"}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBlock;
