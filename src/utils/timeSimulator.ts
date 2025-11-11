/**
 * Time Simulator Utility
 * Allows overriding the current time for testing purposes
 * Uses static absolute time (does not advance automatically)
 */

let staticSimulatedTime: Date | null = null; // Static absolute time (does not advance)
let isSimulationEnabled: boolean = false;

/**
 * Get the current time (real or simulated)
 * When simulation is active, returns the static simulated time (does not advance)
 */
export function getCurrentTime(): Date {
  if (isSimulationEnabled && staticSimulatedTime !== null) {
    return new Date(staticSimulatedTime.getTime()); // Return a copy of the static time
  }
  return new Date();
}

/**
 * Enable time simulation with a specific date/time
 * Sets a static time that does not advance automatically
 */
export function setSimulatedTime(date: Date): void {
  staticSimulatedTime = new Date(date.getTime()); // Store as static absolute time
  isSimulationEnabled = true;
}

/**
 * Disable time simulation (use real time)
 */
export function disableSimulation(): void {
  isSimulationEnabled = false;
  staticSimulatedTime = null;
}

/**
 * Check if simulation is enabled
 */
export function isSimulationActive(): boolean {
  return isSimulationEnabled;
}

/**
 * Get the simulated time if active, otherwise null
 * Returns the static simulated time (does not advance)
 */
export function getSimulatedTime(): Date | null {
  if (isSimulationEnabled && staticSimulatedTime !== null) {
    return new Date(staticSimulatedTime.getTime()); // Return a copy of the static time
  }
  return null;
}

/**
 * Reset simulation to a specific date (useful for testing specific days)
 */
export function resetToDate(date: Date): void {
  setSimulatedTime(date);
}

