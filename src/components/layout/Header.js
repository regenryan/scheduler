import React from "react";
import ThemeSwitcher from "../ThemeSwitcher";

const MenuIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 12h16M4 18h16"
    ></path>
  </svg>
);

function Header({ onMenuClick, currentTheme, onToggleTheme }) {
  return (
    <header className="app-header p-4 print-hide flex justify-between items-center fixed top-0 left-0 right-0 z-40 h-16">
      {" "}
      <button
        onClick={onMenuClick}
        className="text-[var(--theme-app-text)] hover:text-[var(--theme-primary-bg)] lg:hidden"
        title="Open Settings"
        aria-label="Open Settings"
      >
        <MenuIcon />
      </button>
      <div className="w-6 lg:hidden"></div>
      <div className="flex items-center justify-center flex-grow">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--theme-card-heading-text)]">
          Scheduler
        </h1>
        <span className="text-xs text-[var(--theme-app-text)] ml-2 mt-1">
          by adamraiyan
        </span>
      </div>
      <div className="w-auto flex-shrink-0">
        <ThemeSwitcher
          currentTheme={currentTheme}
          onToggleTheme={onToggleTheme}
        />
      </div>
    </header>
  );
}

export default Header;
