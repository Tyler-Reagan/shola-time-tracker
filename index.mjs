/**
 * Sets the default value of the clock-in time input to the current time.
 */
function setDefaultClockInTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const clockInTimeInput = document.getElementById("clockInTime");
  if (clockInTimeInput) {
    clockInTimeInput.value = `${hours}:${minutes}`;
  }
}

/**
 * Converts 24hr time to AM/PM
 */
function format24ToAmerican(hourVal) {
  const pmSuffix = `PM`;
  const amSuffix = `AM`;

  if (hourVal === 12) {
    return String(hourVal), pmSuffix;
  } else if (hourVal === 0) {
    return `12`, amSuffix;
  } else if (hourVal > 12) {
    return String(hourVal - 12).padStart(2, "0"), pmSuffix;
  } else if (hourVal < 12) {
    return String(hourVal).padStart(2, "0"), amSuffix;
  }
}

/**
 * Calculates the clock-out time based on provided parameters.
 * @param {string} clockInTimeStr - The clock-in time in "HH:MM" format.
 * @param {number} lunchBreakMinutes - Duration of lunch break in minutes.
 * @param {number} extraBreakMinutes - Duration of extra break in minutes.
 * @param {number} desiredHoursWorked - Desired number of working hours.
 * @returns {string} The calculated clock-out time in "HH:MM" format.
 */
function calculateClockOutTime(
  clockInTimeStr,
  lunchBreakMinutes,
  extraBreakMinutes,
  desiredHoursWorked
) {
  const [inHours, inMinutes] = clockInTimeStr.split(":").map(Number);
  const clockInDate = new Date();
  clockInDate.setHours(inHours, inMinutes, 0, 0);

  const totalBreakMinutes = lunchBreakMinutes + extraBreakMinutes;

  const desiredWorkMilliseconds = desiredHoursWorked * 60 * 60 * 1000;
  const totalBreakMilliseconds = totalBreakMinutes * 60 * 1000;

  const clockOutMilliseconds =
    clockInDate.getTime() + desiredWorkMilliseconds + totalBreakMilliseconds;

  const clockOutDate = new Date(clockOutMilliseconds);

  const [outHours, suffix] = format24ToAmerican(clockOutDate.getHours());
  const outMinutes = String(clockOutDate.getMinutes()).padStart(2, "0");

  return `${outHours}:${outMinutes} ${suffix}`;
}

/**
 * Handles the form submission event, calculates the clock-out time,
 * and displays the result.
 * @param {Event} event - The form submission event.
 */
function handleClockOutSubmit(event) {
  const clockInTimeStr = document.getElementById("clockInTime").value;
  const lunchBreakMinutes = parseInt(
    document.getElementById("lunchBreak").value
  );
  const extraBreakMinutes = parseInt(
    document.getElementById("extraBreak").value
  );
  const desiredHoursWorked = parseFloat(
    document.getElementById("desiredHoursWorked").value
  );

  const calculatedClockOutTime = calculateClockOutTime(
    clockInTimeStr,
    lunchBreakMinutes,
    extraBreakMinutes,
    desiredHoursWorked
  );

  const resultElement = document.getElementById("clockOutResult");
  if (resultElement) {
    resultElement.textContent = `You should clock out at: ${calculatedClockOutTime}`;
  }
}

function calculateLunchEndTime(lunchStartTimeStr, lunchMinutes) {
  const [inHours, inMinutes] = lunchStartTimeStr.split(":").map(Number);
  const lunchStartDate = new Date();
  lunchStartDate.setHours(inHours, inMinutes, 0, 0);

  const lunchBreakMilliseconds = lunchMinutes * 60 * 1000;

  const lunchEndMilliseconds =
    lunchStartDate.getTime() + lunchBreakMilliseconds;

  const lunchEndDate = new Date(lunchEndMilliseconds);

  const [endHours, suffix] = format24ToAmerican(lunchEndDate.getHours());
  const endMinutes = String(lunchEndDate.getMinutes()).padStart(2, "0");

  return `${endHours}:${endMinutes} ${suffix}`;
}

function handleLunchBreakSubmit(event) {
  const lunchStartTimeStr = document.getElementById("lunchStartTime").value;
  const lunchMinutes = parseInt(
    document.getElementById("lunchBreakLength").value
  );

  const calculatedLunchBreakEndTime = calculateLunchEndTime(
    lunchStartTimeStr,
    lunchMinutes
  );

  const resultElement = document.getElementById("lunchEndResult");
  if (resultElement) {
    resultElement.textContent = `You should end lunch at: ${calculateLunchEndTime}`;
  }
}

// Initialize the form when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  setDefaultClockInTime(); // Set initial time
  const clockOutForm = document.getElementById("clockOutForm");
  if (clockOutForm) {
    clockOutForm.addEventListener("submit", handleClockOutSubmit);
  }
  const lunchEndForm = document.getElementById("lunchEndForm");
  if (lunchEndForm) {
    lunchEndForm.addEventListener("submit", handleLunchBreakSubmit);
  }
});
