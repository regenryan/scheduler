import React, { useState } from "react";

const ArrowDownIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

function AppearanceOptionBlock({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="appearance-option-block">
      {" "}
      <div
        className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-t-md 
                    ${
                      isOpen
                        ? "border-b border-[var(--theme-app-border)]"
                        : "rounded-b-md"
                    }`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium capitalize">{title}</span>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ArrowDownIcon />
        </span>
      </div>
      {isOpen && <div className="appearance-option-content"> {children}</div>}
    </div>
  );
}

export default AppearanceOptionBlock;
