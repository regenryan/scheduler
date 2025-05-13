import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import Layout from "./components/layout/Layout";
import Data from "./components/data/Data";
import ShareLoader from "./components/ShareLoader";
import ScheduleDisplay from "./components/schedule/Schedule";
import Settings from "./components/settings/Settings";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Parser from "./services/parser";
import Scheduler from "./services/scheduler";
import { decodeShareData } from "./utils/shareUtils";
import {
  MAX_DATASETS,
  SCHEDULE_PAGE_SIZE,
  ALL_WEEKDAYS,
  STANDARD_TIMESLOTS,
  TEXT_SIZE_OPTIONS,
  DEFAULT_DATASET_NAME,
  DEFAULT_DATASET_FILENAME,
} from "./services/config";

function App() {
  const [datasets, setDatasets] = useState([]);
  const [currentDatasetId, setCurrentDatasetId] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [filterCategories, setFilterCategories] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [displayedScheduleCount, setDisplayedScheduleCount] =
    useState(SCHEDULE_PAGE_SIZE);
  const [globalScheduleCollapseState, setGlobalScheduleCollapseState] =
    useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appearanceSettings, setAppearanceSettings] = useState({
    timeFormat: "HHMM",
    dayFormat: "FullFirstCaps",
    visibleDays: new Set(ALL_WEEKDAYS),
    visibleTimes: new Set(STANDARD_TIMESLOTS),
    timetableDisplay: "expand",
    textSize: TEXT_SIZE_OPTIONS.default,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState(
    "Select or upload a dataset to begin."
  );
  const [processingError, setProcessingError] = useState(null);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [sharedScheduleData, setSharedScheduleData] = useState(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        return "dark";
      }
    }
    return "light";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return newTheme;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const clearScheduleStates = useCallback(
    (message = "Select or upload a dataset.") => {
      setAllSchedules([]);
      setFilteredSchedules([]);
      setFilterCategories({});
      setActiveFilters({});
      setDisplayedScheduleCount(SCHEDULE_PAGE_SIZE);
      setProcessingError(null);
      setSharedScheduleData(null);
    },
    []
  );

  const handleAppearanceChange = useCallback((newSettings) => {
    setAppearanceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (updated.visibleDays && !(updated.visibleDays instanceof Set)) {
        updated.visibleDays = new Set(updated.visibleDays);
      }
      if (updated.visibleTimes && !(updated.visibleTimes instanceof Set)) {
        updated.visibleTimes = new Set(updated.visibleTimes);
      }
      return updated;
    });
  }, []);

  const addDatasetToList = useCallback(
    (data, name, makeActive = false, isDefault = false) => {
      if (!isDefault && datasets.some((d) => !d.isDefault && d.name === name)) {
        alert(`A custom dataset with the name "${name}" already exists.`);
        return null;
      }
      const currentCustomCount = datasets.filter((d) => !d.isDefault).length;
      if (!isDefault && currentCustomCount >= MAX_DATASETS) {
        alert(
          `Cannot have more than ${MAX_DATASETS} custom datasets. Remove one first.`
        );
        return null;
      }
      const datasetId = `dataset-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newDataset = { id: datasetId, name, data, isDefault };
      setDatasets((prevDatasets) => {
        const nonDefault = prevDatasets.filter((d) => !d.isDefault);
        const defaultDs = prevDatasets.find((d) => d.isDefault);
        if (isDefault) return [newDataset, ...nonDefault];
        return defaultDs
          ? [defaultDs, ...nonDefault, newDataset]
          : [...nonDefault, newDataset];
      });
      if (makeActive) setCurrentDatasetId(datasetId);
      return datasetId;
    },
    [datasets]
  );

  const loadDefaultDataAndMakeActive = useCallback(async () => {
    console.log("Attempting to load Example data...");
    const defaultName = DEFAULT_DATASET_NAME;
    const existingDefault = datasets.find(
      (d) => d.isDefault && d.name === defaultName
    );

    if (existingDefault) {
      console.log(
        `Example dataset exists, activating ID: ${existingDefault.id}`
      );
      if (currentDatasetId !== existingDefault.id) {
        clearScheduleStates();
        setCurrentDatasetId(existingDefault.id);
      }
      return;
    }

    console.log("Fetching and parsing new Example dataset...");
    setIsLoading(true);
    setProcessingError(null);
    clearScheduleStates();

    try {
      // PUBLIC_URL is derived from homepage in package.json or PUBLIC_URL env var.
      // If your homepage is "/scheduler", process.env.PUBLIC_URL will be "/scheduler".
      const publicUrl = process.env.PUBLIC_URL || "";

      // Ensure DEFAULT_DATASET_FILENAME in config.js is "/example.xlsx"
      // This means it already starts with a slash.
      const datasetFilenamePath = DEFAULT_DATASET_FILENAME;

      // Construct the fetch URL.
      // Example: If publicUrl is "/scheduler" and datasetFilenamePath is "/example.xlsx",
      // fetchUrl becomes "/scheduler/example.xlsx".
      // If publicUrl is "" (empty, e.g. no homepage), and your working URL implies /scheduler/example.xlsx,
      // you might need a specific prefix if not handled by PUBLIC_URL.
      // However, since your webpackDevServer serves from appPath (root), and publicUrlOrPath
      // is likely /scheduler/, this should work.
      const fetchUrl = `${publicUrl}${datasetFilenamePath}`;

      console.log(`Workspaceing example data from URL: ${fetchUrl}`); // For debugging

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} while fetching ${fetchUrl}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const parsedData = await Parser.parseXLSX(arrayBuffer);
      if (Parser.validateTimetableData(parsedData)) {
        addDatasetToList(parsedData, defaultName, true, true);
      } else {
        throw new Error("Validation of Example data failed.");
      }
    } catch (error) {
      console.error("Error loading Example data:", error);
      setProcessingError(`Error loading Example data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    datasets,
    addDatasetToList,
    clearScheduleStates,
    currentDatasetId /*, add other dependencies if ESLint complains */,
  ]);

  const handleDatasetSelection = useCallback(
    (id) => {
      console.log(`handleDatasetSelection with ID: ${id}`);
      if (id === "trigger-default-load") {
        const defaultDs = datasets.find((d) => d.isDefault);
        if (!defaultDs) {
          loadDefaultDataAndMakeActive();
        } else {
          if (currentDatasetId !== defaultDs.id) {
            clearScheduleStates();
            setCurrentDatasetId(defaultDs.id);
          }
        }
      } else if (id === currentDatasetId) {
        clearScheduleStates();
        setCurrentDatasetId(null);
      } else {
        clearScheduleStates();
        setCurrentDatasetId(id);
      }
    },
    [
      currentDatasetId,
      datasets,
      loadDefaultDataAndMakeActive,
      clearScheduleStates,
    ]
  );

  const handleDatasetRemoval = useCallback(
    (idToRemove) => {
      const datasetToRemove = datasets.find((d) => d.id === idToRemove);
      if (!datasetToRemove || datasetToRemove.isDefault) return;
      setDatasets((prev) => prev.filter((d) => d.id !== idToRemove));
      if (currentDatasetId === idToRemove) {
        clearScheduleStates();
        setCurrentDatasetId(null);
      }
    },
    [currentDatasetId, datasets, clearScheduleStates]
  );

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      const currentCustomCount = datasets.filter((d) => !d.isDefault).length;
      if (currentCustomCount >= MAX_DATASETS) {
        alert(`Cannot upload more than ${MAX_DATASETS} custom datasets.`);
        return;
      }
      if (datasets.some((d) => !d.isDefault && d.name === file.name)) {
        alert(`A custom dataset with the name "${file.name}" already exists.`);
        return;
      }

      setIsLoading(true);

      setProcessingError(null);
      clearScheduleStates();

      try {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        let parsedData;
        if (fileExtension === "json")
          parsedData = await Parser.parseJSON(await file.text());
        else if (fileExtension === "csv")
          parsedData = await Parser.parseCSV(await file.text());
        else if (fileExtension === "xlsx")
          parsedData = await Parser.parseXLSX(await file.arrayBuffer());
        else throw new Error(`Unsupported file type: ${fileExtension}.`);

        if (Parser.validateTimetableData(parsedData)) {
          addDatasetToList(parsedData, file.name, true, false);
        } else {
          throw new Error(`Validation of ${file.name} failed.`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setProcessingError(`Error processing ${file.name}: ${error.message}`);

        setCurrentDatasetId(null);
        setIsLoading(false);
      }
    },
    [addDatasetToList, datasets, clearScheduleStates]
  );

  const handleFilterChange = useCallback(
    (newActiveFilters) => {
      if (sharedScheduleData) {
        setSharedScheduleData(null);
        setCurrentDatasetId(null);
      }
      setActiveFilters(newActiveFilters);
      setDisplayedScheduleCount(SCHEDULE_PAGE_SIZE);
    },
    [sharedScheduleData]
  );

  const handleLoadFromLink = useCallback(
    (decodedData) => {
      if (!decodedData || !decodedData.schedule || !decodedData.appearance) {
        setProcessingError("Failed to process shared link data.");
        setIsLoading(false);
        return;
      }
      console.log("Loading shared timetable data:", decodedData);
      clearScheduleStates();
      setCurrentDatasetId(null);
      handleAppearanceChange(decodedData.appearance);
      setSharedScheduleData(decodedData.schedule);

      setProcessingError(null);
      setIsLoading(false);
    },
    [handleAppearanceChange, clearScheduleStates]
  );

  const handleLoadMore = useCallback(
    () => setDisplayedScheduleCount((prev) => prev + SCHEDULE_PAGE_SIZE),
    []
  );
  const handleExpandAllCards = useCallback(() => {
    setGlobalScheduleCollapseState("expanded");
    setTimeout(() => setGlobalScheduleCollapseState(null), 100);
  }, []);
  const handleCollapseAllCards = useCallback(() => {
    setGlobalScheduleCollapseState("collapsed");
    setTimeout(() => setGlobalScheduleCollapseState(null), 100);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--base-text-size",
      `${appearanceSettings.textSize}px`
    );
  }, [appearanceSettings.textSize]);

  useEffect(() => {
    const initialTheme = localStorage.getItem("theme");
    if (
      initialTheme === "dark" ||
      (!initialTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    const sharedDataInUrl = decodeShareData(window.location.search);
    if (sharedDataInUrl) {
      handleLoadFromLink(sharedDataInUrl);
      if (window.history.replaceState) {
        window.history.replaceState(
          { path: window.location.pathname },
          "",
          window.location.pathname
        );
      }
    }
    setIsInitialLoadDone(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoadDone || sharedScheduleData || !currentDatasetId) {
      if (
        !currentDatasetId &&
        !sharedScheduleData &&
        isInitialLoadDone &&
        !isLoading
      ) {
        clearScheduleStates();
      }
      return;
    }

    const activeDataset = datasets.find((d) => d.id === currentDatasetId);
    if (!activeDataset || !activeDataset.data) {
      if (!isLoading) clearScheduleStates();
      return;
    }
    if (activeDataset.data.length === 0) {
      if (!isLoading) {
        clearScheduleStates();
      }
      return;
    }

    console.log(`App.js Effect: Processing dataset ${activeDataset.name}`);
    setIsLoading(true);
    setProcessingError(null);

    const timerId = setTimeout(() => {
      try {
        const { categories, activeFilters: defaultActiveFilters } =
          Scheduler.generateFilterCategories(activeDataset.data);
        setFilterCategories(categories);
        setActiveFilters(defaultActiveFilters);
        const allGenSchedules = Scheduler.generateSchedules(activeDataset.data);
        setAllSchedules(allGenSchedules);
      } catch (error) {
        console.error("Error in dataset processing effect:", error);
        setProcessingError(error.message);
        clearScheduleStates();
      } finally {
        setIsLoading(false);
        console.log(
          `App.js Effect: Finished processing dataset ${activeDataset.name}`
        );
      }
    }, 10);
    return () => clearTimeout(timerId);
  }, [
    currentDatasetId,
    datasets,
    sharedScheduleData,
    isInitialLoadDone,
    clearScheduleStates,
  ]);

  useEffect(() => {
    if (isLoading || sharedScheduleData || !isInitialLoadDone) return;

    if (!currentDatasetId || allSchedules.length === 0) {
      if (filteredSchedules.length > 0) setFilteredSchedules([]);
      return;
    }
    console.log("App.js Effect: Applying filters...");
    try {
      const newFilteredSchedules = Scheduler.applyFilters(
        allSchedules,
        activeFilters,
        filterCategories
      );
      setFilteredSchedules(newFilteredSchedules);
      setDisplayedScheduleCount(SCHEDULE_PAGE_SIZE);
    } catch (error) {
      console.error("Error applying filters:", error);
      setProcessingError(error.message);
      setFilteredSchedules([]);
    }
  }, [
    activeFilters,
    allSchedules,
    filterCategories,
    currentDatasetId,
    isLoading,
    sharedScheduleData,
    isInitialLoadDone,
  ]);

  useEffect(() => {
    if (!isInitialLoadDone) return;

    if (isLoading) {
      const activeDataset = datasets.find((d) => d.id === currentDatasetId);
      setPlaceholderMessage(
        activeDataset ? `Processing ${activeDataset.name}...` : "Loading..."
      );
      return;
    }
    if (processingError) {
      setPlaceholderMessage(`Error: ${processingError}`);
      return;
    }
    if (sharedScheduleData) {
      setPlaceholderMessage(
        `Displaying shared schedule: ${sharedScheduleData.code}`
      );
      return;
    }
    if (currentDatasetId) {
      const activeDataset = datasets.find((d) => d.id === currentDatasetId);
      if (
        activeDataset &&
        activeDataset.data &&
        activeDataset.data.length > 0
      ) {
        if (allSchedules.length > 0 && filteredSchedules.length === 0) {
          setPlaceholderMessage("No schedules match the current filters.");
        } else if (allSchedules.length === 0 && !isLoading) {
          setPlaceholderMessage(
            `No possible schedules could be generated for ${activeDataset.name}.`
          );
        } else if (filteredSchedules.length > 0) {
          setPlaceholderMessage("");
        } else {
          setPlaceholderMessage(
            `Processed ${activeDataset.name}. Filters might be too restrictive or no schedules generated.`
          );
        }
      } else if (
        activeDataset &&
        activeDataset.data &&
        activeDataset.data.length === 0
      ) {
        setPlaceholderMessage(
          `Selected dataset "${activeDataset.name}" is empty.`
        );
      } else if (!activeDataset) {
        setPlaceholderMessage("Selected dataset not found.");
      }
    } else {
      setPlaceholderMessage(
        "Select or upload a dataset, or load from a share link."
      );
    }
  }, [
    isLoading,
    processingError,
    currentDatasetId,
    sharedScheduleData,
    filteredSchedules,
    allSchedules,
    datasets,
    isInitialLoadDone,
  ]);

  const activeDatasetName = useMemo(() => {
    if (sharedScheduleData) return `Shared: ${sharedScheduleData.code}`;
    const activeDataset = datasets.find((d) => d.id === currentDatasetId);
    return activeDataset ? activeDataset.name : "";
  }, [datasets, currentDatasetId, sharedScheduleData]);

  const schedulesToShow = useMemo(() => {
    if (sharedScheduleData) return [sharedScheduleData];
    return filteredSchedules.slice(0, displayedScheduleCount);
  }, [sharedScheduleData, filteredSchedules, displayedScheduleCount]);

  const hasMoreSchedules = useMemo(() => {
    if (sharedScheduleData) return false;
    return filteredSchedules.length > displayedScheduleCount;
  }, [sharedScheduleData, filteredSchedules, displayedScheduleCount]);

  return (
    <Layout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      currentTheme={theme}
      onToggleTheme={toggleTheme}
    >
      <Settings
        filterCategories={filterCategories}
        activeFilters={activeFilters}
        appearanceSettings={appearanceSettings}
        onFilterChange={handleFilterChange}
        onAppearanceChange={handleAppearanceChange}
      />
      <div className="p-4 sm:p-6 lg:px-8 lg:py-8">
        <Data
          datasets={datasets}
          currentDatasetId={currentDatasetId}
          onSelect={handleDatasetSelection}
          onRemove={handleDatasetRemoval}
          onUpload={handleFileUpload}
          onLoadDefault={handleDatasetSelection}
        />
        {!currentDatasetId && !sharedScheduleData && isInitialLoadDone && (
          <ShareLoader onLoadFromLink={handleLoadFromLink} className="mb-6" />
        )}
        {processingError && !isLoading && (
          <div
            className="my-4 p-3 bg-red-100 dark:bg-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 text-red-800 rounded-md text-sm"
            role="alert"
          >
            {placeholderMessage.startsWith("Error:")
              ? placeholderMessage
              : `Error: ${processingError}`}
          </div>
        )}
        <ScheduleDisplay
          schedules={schedulesToShow}
          isLoading={isLoading && !sharedScheduleData && !!currentDatasetId}
          placeholderMessage={
            (!isLoading || !currentDatasetId) && placeholderMessage
              ? placeholderMessage
              : ""
          }
          currentDatasetName={activeDatasetName}
          hasMore={hasMoreSchedules}
          onLoadMore={handleLoadMore}
          appearanceSettings={appearanceSettings}
          globalCollapseState={globalScheduleCollapseState}
        />
      </div>
    </Layout>
  );
}

export default App;
