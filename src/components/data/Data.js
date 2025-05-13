import React from "react";
import { DEFAULT_DATASET_NAME } from "../../services/config";

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const RemoveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

function Data({
  datasets = [],
  currentDatasetId,
  onSelect,
  onRemove,
  onUpload,
  onLoadDefault,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    event.target.value = null;
  };

  const handleRemoveClick = (e, id, name) => {
    e.stopPropagation();
    if (
      window.confirm(`Are you sure you want to remove the dataset "${name}"?`)
    ) {
      onRemove(id);
    }
  };

  const defaultDataset = datasets.find((d) => d.isDefault);
  const customDatasets = datasets.filter((d) => !d.isDefault);

  const handleSelectClick = (id) => {
    if (id === currentDatasetId) {
      onSelect(null);
    } else {
      onSelect(id);
    }
  };

  const handleDefaultButtonClick = () => {
    const exampleDs = datasets.find((d) => d.isDefault);
    if (exampleDs) {
      handleSelectClick(exampleDs.id);
    } else {
      onLoadDefault("trigger-default-load");
    }
  };

  return (
    <div className="data-management-card print-hide">
      <h3 className="main-section-title">Datasets</h3>
      <div className="flex items-center flex-wrap gap-2">
        <label
          htmlFor="file-input-react"
          className={`btn-upload cursor-pointer`}
        >
          <UploadIcon />
          Upload
        </label>
        <input
          type="file"
          id="file-input-react"
          accept=".csv,.xlsx,.json"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload dataset file"
        />

        {customDatasets.map((dataset) => (
          <button
            key={dataset.id}
            type="button"
            title={`Select ${dataset.name}`}
            onClick={() => handleSelectClick(dataset.id)}
            className={`dataset-button ${
              dataset.id === currentDatasetId ? "selected" : ""
            }`}
            aria-pressed={dataset.id === currentDatasetId}
          >
            <span className="truncate max-w-[150px] sm:max-w-[200px] mr-1.5">
              {dataset.name}
            </span>
            <span
              className="remove-icon"
              title={`Remove ${dataset.name}`}
              onClick={(e) => handleRemoveClick(e, dataset.id, dataset.name)}
              aria-label={`Remove ${dataset.name}`}
            >
              <RemoveIcon />
            </span>
          </button>
        ))}
        <button
          key="load-or-select-default"
          type="button"
          title={
            defaultDataset
              ? `Select ${DEFAULT_DATASET_NAME}`
              : `Load ${DEFAULT_DATASET_NAME}`
          }
          onClick={handleDefaultButtonClick}
          className={`dataset-button ${
            defaultDataset && defaultDataset.id === currentDatasetId
              ? "selected"
              : ""
          }`}
          aria-pressed={
            defaultDataset && defaultDataset.id === currentDatasetId
          }
        >
          <span className="truncate">{DEFAULT_DATASET_NAME}</span>
        </button>
      </div>
    </div>
  );
}

export default Data;
