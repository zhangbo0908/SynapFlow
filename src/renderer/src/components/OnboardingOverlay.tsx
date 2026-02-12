import React from "react";

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  visible,
  onComplete,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to SynapFlow</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Your new favorite tool for mind mapping and brainstorming.
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};
