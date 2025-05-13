import React from "react";
import Header from "./Header";

function Layout({
  children,
  isSidebarOpen,
  toggleSidebar,
  currentTheme,
  onToggleTheme,
}) {
  const sidebarContent = React.Children.toArray(children).find(
    (child) => child.type?.name === "Settings"
  );
  const mainContent = React.Children.toArray(children).filter(
    (child) => child.type?.name !== "Settings"
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header
        onMenuClick={toggleSidebar}
        currentTheme={currentTheme}
        onToggleTheme={onToggleTheme}
      />
      <div className="flex flex-1 overflow-hidden pt-16">
        <aside
          className={`app-sidebar
            fixed inset-y-0 left-0 z-30 w-72 shadow-xl
            transform transition-transform duration-300 ease-in-out print-hide pt-16
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            flex flex-col
          `}
          aria-hidden={
            !isSidebarOpen &&
            typeof window !== "undefined" &&
            window.innerWidth < 1024
          }
        >
          {sidebarContent}
        </aside>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 print-hide lg:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}
        <main className="app-main-content flex-1 overflow-y-auto transition-margin duration-300 ease-in-out lg:ml-72">
          {" "}
          {mainContent}
        </main>
      </div>
    </div>
  );
}

export default Layout;
