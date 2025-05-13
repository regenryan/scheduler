import React, { useState, useEffect } from "react";
import ScheduleTable from "./Table";
import { encodeShareData } from "../../utils/shareUtils";

const CollapseIcon = ({ isCollapsed }) => (
  <svg
    className={`h-5 w-5 transition-transform duration-300 ${
      isCollapsed ? "-rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
);

const LinkIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

function ScheduleCard({
  scheduleData,
  appearanceSettings,
  globalCollapseState,
}) {
  const initialCollapseState =
    appearanceSettings.timetableDisplay === "collapse";
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseState);
  const [copyStatus, setCopyStatus] = useState(null);

  useEffect(() => {
    if (globalCollapseState === "expanded") {
      setIsCollapsed(false);
    } else if (globalCollapseState === "collapsed") {
      setIsCollapsed(true);
    } else if (globalCollapseState === null) {
      setIsCollapsed(appearanceSettings.timetableDisplay === "collapse");
    }
  }, [globalCollapseState, appearanceSettings.timetableDisplay]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleShare = async (e) => {
    e.stopPropagation();
    setCopyStatus(null);
    console.log("Sharing schedule:", scheduleData.code);

    const queryString = encodeShareData(scheduleData, appearanceSettings);

    if (!queryString) {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(null), 2000);
      return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}${queryString}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Failed to copy share link:", err);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(null), 2000);
      console.log("Share URL (copy manually):", shareUrl);
    }
  };

  return (
    <div className="schedule-card print-hide">
      <div
        className="flex justify-between items-center p-3 cursor-pointer border-b"
        onClick={toggleCollapse}
        role="button"
        aria-expanded={!isCollapsed}
      >
        <h3 className="text-base font-semibold flex-grow mr-2 overflow-hidden whitespace-nowrap text-ellipsis">
          {" "}
          {scheduleData.code.split(" | ").map((tag) => (
            <span key={tag} className="schedule-tag">
              {tag}
            </span>
          ))}
        </h3>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            className={`p-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors ${
              copyStatus === "success"
                ? "text-green-600 dark:text-green-400"
                : copyStatus === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-[var(--theme-app-text)] hover:text-[var(--theme-primary-bg)] hover:bg-[var(--theme-app-border)]"
            }`}
            title={
              copyStatus === "success"
                ? "Copied!"
                : copyStatus === "error"
                ? "Copy Failed"
                : "Copy Share Link"
            }
            aria-label="Copy Share Link"
            onClick={handleShare}
            disabled={!!copyStatus}
          >
            <LinkIcon />
          </button>
          <button
            className="p-1.5 text-[var(--theme-app-text)] hover:text-[var(--theme-primary-bg)] hover:bg-[var(--theme-app-border)] rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
            title={isCollapsed ? "Expand Schedule" : "Collapse Schedule"}
            aria-label={isCollapsed ? "Expand Schedule" : "Collapse Schedule"}
          >
            <CollapseIcon isCollapsed={isCollapsed} />
          </button>
        </div>
      </div>

      <div
        className={`schedule-table-wrapper transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed
            ? "max-h-0 opacity-0 border-t-0"
            : "max-h-[1000px] opacity-100 px-4 py-4 border-t"
        }`}
        style={{ maxHeight: isCollapsed ? "0" : "1000px" }}
      >
        <ScheduleTable
          schedule={scheduleData.schedule}
          appearanceSettings={appearanceSettings}
        />
      </div>
    </div>
  );
}

function LoadMoreButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[var(--theme-primary-text)] bg-[var(--theme-primary-bg)] hover:bg-[var(--theme-primary-hover-bg)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-primary-focus-ring)] print-hide"
    >
      Load More
    </button>
  );
}

function ScheduleDisplay({
  schedules = [],
  isLoading = false,
  placeholderMessage = "Loading...",
  currentDatasetName = "",
  hasMore = false,
  onLoadMore,
  appearanceSettings,
  globalCollapseState,
}) {
  return (
    <section className="schedule-display-section">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <div>
          <h2 className="main-section-title">Schedules</h2>
          {schedules.length > 0 && (
            <span className="text-sm text-[var(--theme-app-text)]">
              {" "}
              Showing {schedules.length} schedule(s)
              {currentDatasetName && ` for ${currentDatasetName}`}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-8">
        {isLoading && (
          <p className="text-center py-10 text-[var(--theme-app-text)]">
            {" "}
            Loading schedules...
          </p>
        )}
        {!isLoading && schedules.length === 0 && placeholderMessage && (
          <div className="placeholder-content-area">
            <p className="text-center italic text-[var(--theme-app-text)]">
              {" "}
              {placeholderMessage}
            </p>
          </div>
        )}
        {!isLoading &&
          schedules.length > 0 &&
          schedules.map((sched, index) => (
            <ScheduleCard
              key={sched.code ? `${sched.code}-${index}` : index}
              scheduleData={sched}
              appearanceSettings={appearanceSettings}
              globalCollapseState={globalCollapseState}
            />
          ))}

        {!isLoading && hasMore && (
          <div className="flex justify-center">
            <LoadMoreButton onClick={onLoadMore} />
          </div>
        )}
      </div>
    </section>
  );
}

export default ScheduleDisplay;
