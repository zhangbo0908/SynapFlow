import React from "react";

interface SaveStatusProps {
  isSaving: boolean;
  lastSavedTime: Date | null;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ isSaving, lastSavedTime }) => {
  if (isSaving) {
    return <span className="text-xs text-ui-secondary">Saving...</span>;
  }

  if (lastSavedTime) {
    return (
      <span className="text-xs text-ui-secondary opacity-80">
        Saved {lastSavedTime.toLocaleTimeString()}
      </span>
    );
  }

  return <span className="text-xs text-ui-secondary opacity-80">Unsaved</span>;
};

export default SaveStatus;
