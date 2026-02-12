import { useState, useEffect, useRef } from "react";
import { useMindmapStore } from "../store/useMindmapStore";

export const useAutoSave = () => {
  const data = useMindmapStore((state) => state.data);
  const currentFilePath = useMindmapStore((state) => state.currentFilePath);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Use a ref to store the last saved data string to compare against
  const lastSavedSnapshot = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect 1: Handle File Switch (Reset snapshot)
  useEffect(() => {
    if (currentFilePath) {
      lastSavedSnapshot.current = JSON.stringify(data);
      // Cancel any pending save from previous file
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSaving(false);
    }
  }, [currentFilePath]); // Only when path changes (Load / Save As)

  // Effect 2: Handle Data Change
  useEffect(() => {
    if (!currentFilePath) return;

    const currentSnapshot = JSON.stringify(data);

    // If data hasn't changed from last save/load, do nothing
    if (currentSnapshot === lastSavedSnapshot.current) {
      // If we reverted to a clean state (e.g. via undo), cancel pending save
      if (isSaving && timerRef.current) {
        clearTimeout(timerRef.current);
        setIsSaving(false);
      }
      return;
    }

    // Data changed -> Schedule Save
    setIsSaving(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await window.api.file.save(data, currentFilePath);
        setLastSavedTime(new Date());
        lastSavedSnapshot.current = JSON.stringify(data);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 seconds debounce

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, currentFilePath]);

  const markAsSaved = () => {
    lastSavedSnapshot.current = JSON.stringify(data);
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSaving(false);
    setLastSavedTime(new Date());
  };

  return { isSaving, lastSavedTime, markAsSaved };
};
