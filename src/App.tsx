import { useState } from "react";
import { DayTracker } from "./components/DayTracker";
import { DiscountCalculator } from "./components/DiscountCalculator";
import { TimeEntry, DayState } from "./types";

function App() {
  const [activeTab, setActiveTab] = useState<
    "day-tracker" | "discount-calculator"
  >("day-tracker");
  const [dayState, setDayState] = useState<DayState>({
    isActive: false,
    entries: [],
  });

  const handleStartDay = () => {
    const now = new Date();
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: "clock-in",
    };

    setDayState({
      isActive: true,
      entries: [newEntry],
      startTime: now,
    });
  };

  const handleEndDay = () => {
    const now = new Date();
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: "clock-out",
    };

    setDayState((prev) => ({
      ...prev,
      isActive: false,
      entries: [...prev.entries, newEntry],
      endTime: now,
    }));
  };

  const handleToggleEntry = (entryId: string) => {
    setDayState((prev) => {
      const entryIndex = prev.entries.findIndex((e) => e.id === entryId);
      if (entryIndex === -1) return prev;

      const entry = prev.entries[entryIndex];
      const newType = entry.type === "clock-in" ? "clock-out" : "clock-in";

      const updatedEntries = [...prev.entries];
      updatedEntries[entryIndex] = {
        ...entry,
        type: newType,
        timestamp: new Date(),
      };

      return {
        ...prev,
        entries: updatedEntries,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab("day-tracker")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "day-tracker"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Day Tracker
            </button>
            <button
              onClick={() => setActiveTab("discount-calculator")}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "discount-calculator"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Discount Calculator
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "day-tracker" && (
          <DayTracker
            dayState={dayState}
            onStartDay={handleStartDay}
            onEndDay={handleEndDay}
            onToggleEntry={handleToggleEntry}
          />
        )}
        {activeTab === "discount-calculator" && <DiscountCalculator />}
      </main>
    </div>
  );
}

export default App;
