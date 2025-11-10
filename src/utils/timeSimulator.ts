/**
 * Time Simulator Utility
 * Allows overriding the current time for testing purposes
 */

let timeOffset: number | null = null; // Offset in milliseconds from real time
let isSimulationEnabled: boolean = false;

/**
 * Get the current time (real or simulated)
 */
export function getCurrentTime(): Date {
  if (isSimulationEnabled && timeOffset !== null) {
    return new Date(Date.now() + timeOffset);
  }
  return new Date();
}

/**
 * Enable time simulation with a specific date/time
 */
export function setSimulatedTime(date: Date): void {
  timeOffset = date.getTime() - Date.now();
  isSimulationEnabled = true;
}

/**
 * Disable time simulation (use real time)
 */
export function disableSimulation(): void {
  isSimulationEnabled = false;
  timeOffset = null;
}

/**
 * Check if simulation is enabled
 */
export function isSimulationActive(): boolean {
  return isSimulationEnabled;
}

/**
 * Get the simulated time if active, otherwise null
 */
export function getSimulatedTime(): Date | null {
  if (isSimulationEnabled && timeOffset !== null) {
    return new Date(Date.now() + timeOffset);
  }
  return null;
}

/**
 * Reset simulation to a specific date (useful for testing specific days)
 */
export function resetToDate(date: Date): void {
  setSimulatedTime(date);
}

