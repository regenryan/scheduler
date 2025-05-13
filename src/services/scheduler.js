const Scheduler = {
  generateFilterCategories(timetables) {
    const categories = {};
    timetables.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        const rawValue = String(entry[key] || "").trim();
        let finalValue = rawValue;
        if (key === "section") {
          const courseName = String(entry.course || "").trim();
          if (courseName && rawValue) {
            finalValue = `${courseName}-${rawValue}`;
          } else {
            finalValue = "";
          }
        }
        if (finalValue !== "") {
          if (!categories[key]) {
            categories[key] = new Set();
          }
          categories[key].add(finalValue);
        }
      });
    });
    const activeFilters = {};
    Object.keys(categories).forEach((cat) => {
      activeFilters[cat] = new Set(categories[cat]);
    });

    return { categories, activeFilters };
  },

  generateSchedules(timetables) {
    if (!timetables || timetables.length === 0) return [];
    const courseSectionsMap = {};
    timetables.forEach(({ course, section, ...slotDetails }) => {
      const courseKey = String(course).trim();
      const sectionKey = String(section).trim();
      if (!courseKey || !sectionKey) return;
      if (!courseSectionsMap[courseKey]) {
        courseSectionsMap[courseKey] = {};
      }
      if (!courseSectionsMap[courseKey][sectionKey]) {
        courseSectionsMap[courseKey][sectionKey] = [];
      }
      const { day, time, location, lecturer, type } = slotDetails;
      if (
        day &&
        time &&
        String(day).trim() !== "" &&
        String(time).trim() !== ""
      ) {
        courseSectionsMap[courseKey][sectionKey].push({
          day: String(day).trim(),
          time: String(time).trim(),
          location: String(location || "").trim(),
          lecturer: String(lecturer || "").trim(),
          type: String(type || "").trim(),
        });
      }
    });
    const courses = Object.keys(courseSectionsMap);
    const validSchedules = [];
    const combineSchedules = (courseIndex, currentCombination) => {
      if (courseIndex === courses.length) {
        if (
          currentCombination.length > 0 &&
          this.isValidSchedule(currentCombination)
        ) {
          const scheduleCode = currentCombination
            .map(({ course, section }) => `${course}-${section}`)
            .sort()
            .join(" | ");
          validSchedules.push({
            code: scheduleCode,
            schedule: currentCombination,
          });
        }
        return;
      }
      const currentCourse = courses[courseIndex];
      const sections = Object.keys(courseSectionsMap[currentCourse]);
      sections.forEach((section) => {
        if (
          courseSectionsMap[currentCourse][section] &&
          courseSectionsMap[currentCourse][section].length > 0
        ) {
          combineSchedules(courseIndex + 1, [
            ...currentCombination,
            {
              course: currentCourse,
              section: section,
              slots: courseSectionsMap[currentCourse][section],
            },
          ]);
        }
      });
      combineSchedules(courseIndex + 1, currentCombination);
    };
    combineSchedules(0, []);

    return validSchedules;
  },

  isValidSchedule(scheduleAttempt) {
    const occupiedSlots = new Set();
    for (const courseSection of scheduleAttempt) {
      for (const slot of courseSection.slots) {
        if (!slot.day || !slot.time) continue;
        const slotKey = `${slot.day}-${slot.time}`;
        if (occupiedSlots.has(slotKey)) {
          return false;
        }
        occupiedSlots.add(slotKey);
      }
    }
    return true;
  },

  applyFilters(allSchedules, activeFilters, filterCategories) {
    console.log(
      "Applying filters: Strict Course COUNT -> Ticked Values Check..."
    );

    if (
      !activeFilters ||
      Object.keys(activeFilters).length === 0 ||
      !filterCategories
    ) {
      return allSchedules;
    }

    const getScheduleValuesForCategory = (scheduleData, category) => {
      const values = new Set();
      if (category === "course") {
        scheduleData.schedule.forEach((item) =>
          values.add(String(item.course).trim())
        );
      } else if (category === "section") {
        scheduleData.schedule.forEach((item) => {
          const courseName = String(item.course).trim();
          const sectionNumber = String(item.section).trim();
          if (courseName && sectionNumber) {
            values.add(`${courseName}-${sectionNumber}`);
          }
        });
      } else {
        scheduleData.schedule.forEach((item) => {
          item.slots.forEach((slot) => {
            if (
              Object.hasOwnProperty.call(slot, category) &&
              slot[category] != null &&
              String(slot[category]).trim() !== ""
            ) {
              values.add(String(slot[category]).trim());
            }
          });
        });
      }
      return values;
    };

    const filtered = allSchedules.filter((scheduleData) => {
      const selectedCourses = activeFilters["course"];

      if (selectedCourses && selectedCourses.size > 0) {
        const numberOfSelectedCourses = selectedCourses.size;
        const scheduleCourses = getScheduleValuesForCategory(
          scheduleData,
          "course"
        );
        const numberOfCoursesInSchedule = scheduleCourses.size;

        if (numberOfCoursesInSchedule !== numberOfSelectedCourses) {
          return false;
        }
      }

      for (const category in activeFilters) {
        if (!Object.hasOwnProperty.call(activeFilters, category)) continue;

        if (!filterCategories?.[category]) continue;

        const selectedValues = activeFilters[category];
        const scheduleValuesInCategory = getScheduleValuesForCategory(
          scheduleData,
          category
        );

        if (scheduleValuesInCategory.size === 0) {
          continue;
        }

        for (const scheduleValue of scheduleValuesInCategory) {
          if (!selectedValues.has(scheduleValue)) {
            return false;
          }
        }
      }

      return true;
    });

    console.log(`Filtering complete. ${filtered.length} schedules remain.`);
    return filtered;
  },
};

export default Scheduler;
