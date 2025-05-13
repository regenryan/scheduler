import React, { useMemo, useCallback } from "react";
import FilterBlock from "./FilterBlock";
import Appearance from "./Appearance";

function Settings({
  filterCategories = {},
  activeFilters = {},
  appearanceSettings = {},
  onFilterChange,
  onAppearanceChange,
}) {
  const relevantSections = useMemo(() => {
    const selectedCourses = activeFilters.course || new Set();
    if (selectedCourses.size === 0 || !filterCategories.section) {
      return new Set();
    }
    const sections = new Set();
    filterCategories.section.forEach((courseSection) => {
      const [courseName] = String(courseSection).split("-");
      if (selectedCourses.has(courseName)) {
        sections.add(courseSection);
      }
    });
    return sections;
  }, [activeFilters.course, filterCategories.section]);

  const filterOrder = [
    "course",
    "section",
    "day",
    "time",
    "type",
    "lecturer",
    "location",
  ];

  const sortedCategoryEntries = useMemo(() => {
    return filterOrder
      .map((category) => [category, filterCategories[category]])
      .filter(
        ([, valuesSet]) => valuesSet instanceof Set && valuesSet.size > 0
      );
  }, [filterCategories]);

  const handleFilterItemChange = useCallback(
    ({ category, value, checked }) => {
      const currentSet = activeFilters[category]
        ? new Set(activeFilters[category])
        : new Set();

      if (checked) {
        currentSet.add(value);
      } else {
        currentSet.delete(value);
      }

      const updatedFilters = { ...activeFilters, [category]: currentSet };

      if (category === "course" && filterCategories.section) {
        const newlySelectedCourses = updatedFilters.course || new Set();
        const newActiveSections = new Set();

        filterCategories.section.forEach((courseSection) => {
          const [courseName] = String(courseSection).split("-");
          if (newlySelectedCourses.has(courseName)) {
            newActiveSections.add(courseSection);
          }
        });
        updatedFilters.section = newActiveSections;
      }
      onFilterChange(updatedFilters);
    },
    [activeFilters, onFilterChange, filterCategories.section]
  );

  const handleSelectAllChange = useCallback(
    ({ category, checked }) => {
      let valuesToSet;
      const allValuesInCategory = filterCategories[category]
        ? new Set(filterCategories[category])
        : new Set();

      if (category === "section") {
        valuesToSet = checked ? new Set(relevantSections) : new Set();
      } else {
        valuesToSet = checked ? allValuesInCategory : new Set();
      }

      const updatedFilters = { ...activeFilters, [category]: valuesToSet };

      if (category === "course" && filterCategories.section) {
        const newActiveSections = new Set();
        if (checked) {
          filterCategories.section.forEach((section) =>
            newActiveSections.add(section)
          );
        }
        updatedFilters.section = newActiveSections;
      }
      onFilterChange(updatedFilters);
    },
    [activeFilters, filterCategories, onFilterChange, relevantSections]
  );

  const showSectionFilter =
    activeFilters.course && activeFilters.course.size > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="settings-panel-header">
        <h2 className="main-section-title !mb-0">Settings</h2>{" "}
      </div>

      <div className="settings-panel-content">
        <section id="filters">
          <h3 className="settings-subheading">Filters</h3>
          <div id="filters-container" className="space-y-3">
            {sortedCategoryEntries.length === 0 && (
              <span className="text-sm italic">
                No filters available for current data.
              </span>
            )}
            {sortedCategoryEntries.map(([category, valuesSet]) => {
              if (category === "section" && !showSectionFilter) {
                return null;
              }
              const valuesForBlock =
                category === "section"
                  ? Array.from(relevantSections)
                  : Array.from(valuesSet);
              const activeSetForBlock = activeFilters[category] || new Set();
              return (
                <FilterBlock
                  key={category}
                  category={category}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  values={valuesForBlock}
                  activeFilters={activeSetForBlock}
                  onFilterChange={handleFilterItemChange}
                  onSelectAll={handleSelectAllChange}
                  disableSelectAll={
                    category === "section" && relevantSections.size === 0
                  }
                />
              );
            })}
          </div>
        </section>
        <section id="appearance-section" className="mt-4 pt-4 border-t">
          <h3 className="settings-subheading">Appearance</h3>
          <Appearance
            appearanceSettings={appearanceSettings}
            onAppearanceChange={onAppearanceChange}
          />
        </section>
      </div>
    </div>
  );
}

export default Settings;
