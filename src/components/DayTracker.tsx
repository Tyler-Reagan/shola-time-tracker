import React from "react";
import { DayState } from "../types";

interface DayTrackerProps {
  dayState: DayState;
  onStartDay: () => void;
  onEndDay: () => void;
  onToggleEntry: (entryId: string) => void;
}

export const DayTracker: React.FC<DayTrackerProps> = ({
  dayState,
  onStartDay,
  onEndDay,
  onToggleEntry,
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalWorkTime = (): string => {
    if (!dayState.startTime || dayState.entries.length === 0) {
      return "0h 0m";
    }

    let totalMinutes = 0;
    let clockInTime: Date | null = null;

    for (const entry of dayState.entries) {
      if (entry.type === "clock-in") {
        clockInTime = entry.timestamp;
      } else if (entry.type === "clock-out" && clockInTime) {
        const diffMs = entry.timestamp.getTime() - clockInTime.getTime();
        totalMinutes += Math.floor(diffMs / (1000 * 60));
        clockInTime = null;
      }
    }

    // If currently clocked in, add time up to now
    if (clockInTime && dayState.isActive) {
      const diffMs = new Date().getTime() - clockInTime.getTime();
      totalMinutes += Math.floor(diffMs / (1000 * 60));
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with today's date and day controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Day Tracker</h1>
            <p className="text-gray-600">{formatDate(new Date())}</p>
          </div>

          <div className="flex gap-3">
            {!dayState.isActive ? (
              <button
                onClick={onStartDay}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Start Day
              </button>
            ) : (
              <button
                onClick={onEndDay}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                End Day
              </button>
            )}
          </div>
        </div>

        {/* Total work time display */}
        {dayState.entries.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Total Work Time Today:
              </span>
              <span className="text-lg font-bold text-blue-900">
                {getTotalWorkTime()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Time entries table */}
      {dayState.entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Time Entries
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dayState.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatTime(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === "clock-in"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.type === "clock-in" ? "Clock In" : "Clock Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => onToggleEntry(entry.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          entry.type === "clock-in"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {entry.type === "clock-in" ? "Clock Out" : "Clock In"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {dayState.entries.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No time entries yet
          </h3>
          <p className="text-gray-500">
            Click "Start Day" to begin tracking your work time.
          </p>
        </div>
      )}
    </div>
  );
};
