import React, { useState, useCallback, useEffect } from "react";
import { decodeShareData } from "../utils/shareUtils";

const PasteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

function ShareLoader({ onLoadFromLink, className = "" }) {
  const [linkValue, setLinkValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadAttempted, setLoadAttempted] = useState(false);

  const attemptLoadFromLink = useCallback(
    async (text) => {
      if (!text || isLoading) {
        if (!text) {
          setError(null);
          setLoadAttempted(false);
        }
        return;
      }

      console.log("Attempting to load from link value:", text);
      setError(null);
      setIsLoading(true);
      setLoadAttempted(true);

      try {
        let queryString = "";
        if (text.includes("?")) {
          queryString = text.substring(text.indexOf("?"));
        } else if (text.startsWith("?share=")) {
          queryString = text;
        } else {
          if (/^[a-zA-Z0-9_-]+$/.test(text)) {
            queryString = `?share=${text}`;
          } else {
            throw new Error("Invalid link format.");
          }
        }

        const decodedData = decodeShareData(queryString);

        if (decodedData) {
          onLoadFromLink(decodedData);
          setError(null);
        } else {
          throw new Error("Invalid or corrupted share link data.");
        }
      } catch (err) {
        console.error("Error loading from link:", err);
        setError(err.message || "Failed to load timetable from link.");
      } finally {
        setIsLoading(false);
      }
    },
    [onLoadFromLink, isLoading]
  );

  const handlePaste = useCallback(async () => {
    setLoadAttempted(false);
    try {
      const text = await navigator.clipboard.readText();
      setLinkValue(text);
      await attemptLoadFromLink(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      setError("Failed to read clipboard.");
    }
  }, [attemptLoadFromLink]);

  const handleInputChange = (e) => {
    const newLinkValue = e.target.value;
    setLinkValue(newLinkValue);
    setLoadAttempted(false);
    setError(null);
    attemptLoadFromLink(newLinkValue);
  };

  return (
    <div className={`share-loader ${className} print-hide`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Shared Timetable
      </h3>
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={linkValue}
            onChange={handleInputChange}
            placeholder="Paste share link here..."
            aria-label="Paste share link"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
          />
          <button
            type="button"
            onClick={handlePaste}
            title="Paste from clipboard"
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-700 rounded-r-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Paste from clipboard"
          >
            <PasteIcon />
          </button>
        </div>
      </div>
      {isLoading && (
        <p className="text-blue-600 text-xs mt-1.5">Loading timetable...</p>
      )}
      {error && !isLoading && (
        <p className="text-red-600 text-xs mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ShareLoader;
