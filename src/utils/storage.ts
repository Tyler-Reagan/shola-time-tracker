import { DayState } from "../types";

const STORAGE_KEY = "shola-time-tracker-day-state";

// Serialize DayState for localStorage (convert Dates to ISO strings)
export function serializeDayState(state: DayState): string {
  const serialized = {
    ...state,
    entries: state.entries.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    })),
    startTime: state.startTime?.toISOString(),
    endTime: state.endTime?.toISOString(),
    dayDate: state.dayDate?.toISOString(),
  };
  return JSON.stringify(serialized);
}

// Deserialize DayState from localStorage (convert ISO strings back to Dates)
export function deserializeDayState(serialized: string): DayState | null {
  try {
    const parsed = JSON.parse(serialized) as {
      isActive: boolean;
      entries: Array<{
        id: string;
        timestamp: string;
        type: "clock-in" | "clock-out";
        reason?: string;
      }>;
      startTime?: string;
      endTime?: string;
      dayDate?: string;
    };
    return {
      ...parsed,
      entries: parsed.entries.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
      startTime: parsed.startTime ? new Date(parsed.startTime) : undefined,
      endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
      dayDate: parsed.dayDate ? new Date(parsed.dayDate) : undefined,
    };
  } catch (error) {
    console.error("Failed to deserialize day state:", error);
    return null;
  }
}

// Check if a date is today (same calendar day)
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// Save DayState to localStorage
export function saveDayState(state: DayState): boolean {
  try {
    const serialized = serializeDayState(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    // Handle quota exceeded or other storage errors
    if (error instanceof DOMException) {
      console.error("localStorage error:", error.message);
    } else {
      console.error("Failed to save day state:", error);
    }
    return false;
  }
}

// Load DayState from localStorage
export function loadDayState(): DayState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const state = deserializeDayState(stored);
    if (!state) {
      return null;
    }

    // If the stored state is from a different day, clear it
    if (state.dayDate && !isToday(state.dayDate)) {
      clearDayState();
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to load day state:", error);
    return null;
  }
}

// Clear DayState from localStorage
export function clearDayState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear day state:", error);
  }
}

// Check if localStorage is available
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

