import * as XLSX from "xlsx";

const Parser = {
  normalizeEntry(entry) {
    const normalized = {};

    for (const key in entry) {
      if (Object.hasOwnProperty.call(entry, key)) {
        normalized[key.toLowerCase().trim()] = entry[key];
      }
    }

    const requiredFields = [
      "course",
      "section",
      "day",
      "time",
      "location",
      "lecturer",
      "type",
    ];
    const finalEntry = {};

    requiredFields.forEach((field) => {
      let value = normalized[field];

      if (typeof value === "number" && !isNaN(value)) {
        value = String(value);
      } else if (value instanceof Date) {
        value = value.toISOString();
      }

      if (
        field === "time" &&
        typeof value === "string" &&
        /^\d{1,4}$/.test(value.trim())
      ) {
        value = value.trim().padStart(4, "0");
      }

      if (typeof value === "string") {
        value = value.trim();
      }

      if (value === null || value === undefined) {
        value = "";
      }
      finalEntry[field] = value;
    });

    return finalEntry;
  },

  validateTimetableData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Validation Failed: Data is not an array or is empty.");
      return false;
    }
    const requiredFields = ["course", "section", "day", "time"];
    let isValid = true;

    data.forEach((entry, index) => {
      const hasRequiredFields = requiredFields.every(
        (field) =>
          Object.hasOwnProperty.call(entry, field) &&
          entry[field] !== null &&
          entry[field] !== undefined &&
          String(entry[field]).trim() !== ""
      );
      if (!hasRequiredFields) {
        console.error(
          `Validation Failed at entry ${index}: Missing required fields (course, section, day, time). Entry:`,
          entry
        );
        isValid = false;
      }
      if (
        Object.hasOwnProperty.call(entry, "time") &&
        entry.time &&
        !/^\d{4}$/.test(String(entry.time))
      ) {
        console.error(
          `Validation Failed at entry ${index}: Invalid time format '${entry.time}'. Expected 'HHMM'. Entry:`,
          entry
        );
        isValid = false;
      }
    });

    if (!isValid) {
      console.warn(
        "Data validation failed. Some entries might be ignored or cause errors."
      );
    }
    return isValid;
  },

  async parseJSON(jsonDataString) {
    try {
      const parsed = JSON.parse(jsonDataString);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid JSON format: Expected an array of objects.");
      }
      return parsed.map(this.normalizeEntry);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      throw new Error(`Invalid JSON file format: ${e.message}`);
    }
  },

  async parseCSV(csvDataString) {
    const lines = csvDataString
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2)
      throw new Error("CSV file is empty or has no data rows.");

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
    const requiredCsvHeaders = ["course", "section", "day", "time"];
    if (!requiredCsvHeaders.every((h) => headers.includes(h))) {
      throw new Error(
        `CSV file is missing required headers: ${requiredCsvHeaders.join(
          ", "
        )}.`
      );
    }

    const parseCsvLine = (line) => {
      return line.split(",").map((val) => val.trim().replace(/^"|"$/g, ""));
    };

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const entry = headers.reduce((obj, header, index) => {
        obj[header] = values[index] || "";
        return obj;
      }, {});
      return this.normalizeEntry(entry);
    });
  },

  async parseXLSX(arrayBuffer) {
    try {
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("No sheets found in the XLSX file.");

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheetName],
        {
          raw: true,
          defval: "",
        }
      );

      return jsonData.map(this.normalizeEntry);
    } catch (e) {
      console.error("Error parsing XLSX:", e);
      throw new Error(`Failed to parse XLSX file: ${e.message}`);
    }
  },
};

export default Parser;
