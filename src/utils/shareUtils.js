import { SCHEDULE_PAGE_SIZE } from "../services/config";

export function encodeShareData(scheduleData, appearanceSettings) {
  if (!scheduleData || !appearanceSettings) {
    console.error("Missing data for encoding share link.");
    return "";
  }

  try {
    const serializableAppearance = { ...appearanceSettings };
    if (serializableAppearance.visibleDays instanceof Set) {
      serializableAppearance.visibleDays = Array.from(
        serializableAppearance.visibleDays
      );
    }
    if (serializableAppearance.visibleTimes instanceof Set) {
      serializableAppearance.visibleTimes = Array.from(
        serializableAppearance.visibleTimes
      );
    }

    const dataToEncode = {
      schedule: scheduleData,
      appearance: serializableAppearance,
    };

    const jsonString = JSON.stringify(dataToEncode);
    const base64String = btoa(unescape(encodeURIComponent(jsonString)));
    const urlSafeBase64String = base64String
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const maxLength = 2000;
    if (urlSafeBase64String.length > maxLength - 100) {
      console.warn(
        "Generated share link is very long, might cause issues in some browsers."
      );
    }

    const params = new URLSearchParams();
    params.set("share", urlSafeBase64String);
    return `?${params.toString()}`;
  } catch (error) {
    console.error("Error encoding share data:", error);
    return "";
  }
}

export function decodeShareData(queryString) {
  const params = new URLSearchParams(queryString);
  const encodedData = params.get("share");

  if (!encodedData) {
    return null;
  }

  try {
    let base64String = encodedData.replace(/-/g, "+").replace(/_/g, "/");

    const jsonString = decodeURIComponent(escape(atob(base64String)));
    const decodedData = JSON.parse(jsonString);

    if (
      !decodedData ||
      typeof decodedData !== "object" ||
      !decodedData.schedule ||
      !decodedData.appearance
    ) {
      throw new Error("Invalid share data structure.");
    }

    if (
      decodedData.appearance.visibleDays &&
      Array.isArray(decodedData.appearance.visibleDays)
    ) {
      decodedData.appearance.visibleDays = new Set(
        decodedData.appearance.visibleDays
      );
    } else {
      decodedData.appearance.visibleDays = new Set();
    }

    if (
      decodedData.appearance.visibleTimes &&
      Array.isArray(decodedData.appearance.visibleTimes)
    ) {
      decodedData.appearance.visibleTimes = new Set(
        decodedData.appearance.visibleTimes
      );
    } else {
      decodedData.appearance.visibleTimes = new Set();
    }

    return decodedData;
  } catch (error) {
    console.error("Error decoding share data:", error);
    return null;
  }
}
