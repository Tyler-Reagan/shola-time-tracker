import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccessTime,
  PlayArrow,
  Stop,
  Coffee,
  Schedule,
  Edit,
  MoreVert,
  Delete,
} from "@mui/icons-material";
import { DayState } from "../types";
import { getCurrentTime, isSimulationActive } from "../utils/timeSimulator";

interface WorkHoursTrackerProps {
  dayState: DayState;
  onStartDay: (clearExisting?: boolean) => void;
  onEndDay: () => void;
  onToggleEntry: (entryId: string, reason?: string) => void;
  onUpdateEntry: (entryId: string, newTimestamp: Date) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const WorkHoursTracker: React.FC<WorkHoursTrackerProps> = ({
  dayState,
  onStartDay,
  onEndDay,
  onToggleEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editingEntryId, setEditingEntryId] = React.useState<string | null>(
    null
  );
  const [editDateTime, setEditDateTime] = React.useState<string>("");
  const [menuAnchor, setMenuAnchor] = React.useState<{
    element: HTMLElement;
    entryId: string;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletingEntryId, setDeletingEntryId] = React.useState<string | null>(
    null
  );
  const [showPreviousPeriodCard, setShowPreviousPeriodCard] =
    React.useState(false);
  const [previousPeriodHours, setPreviousPeriodHours] = React.useState<{
    hours: number;
    periodStart: Date;
    periodEnd: Date;
  } | null>(null);
  // Real-time ticker for live updates (triggers re-renders to update time-based calculations)
  const [, setTick] = React.useState<number>(0);

  // Check if there's an active clock-in
  const hasActiveClockIn = React.useMemo(() => {
    if (dayState.entries.length === 0) return false;
    const lastEntry = dayState.entries[dayState.entries.length - 1];
    return lastEntry.type === "clock-in";
  }, [dayState.entries]);

  // Update ticker to refresh live calculations
  // Update more frequently when simulator is active or when there's an active clock-in
  React.useEffect(() => {
    const isSimulatorActive = isSimulationActive();
    let intervalMs: number;

    if (isSimulatorActive) {
      // When simulator is active, update every 5 seconds for responsiveness
      intervalMs = 5000;
    } else if (hasActiveClockIn) {
      // When actively clocked in, update every 15 seconds
      intervalMs = 15000;
    } else {
      // Otherwise, update every minute
      intervalMs = 60000;
    }

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [hasActiveClockIn]);

  // Shared time formatting utilities
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

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Tracking period constants and utilities
  const TRACKING_PERIOD_START_HOUR = 12; // 12pm
  const DAILY_HOUR_TARGETS: Record<number, number> = {
    1: 9, // Monday
    2: 9, // Tuesday
    3: 9, // Wednesday
    4: 9, // Thursday
    5: 4, // Friday
  };

  /**
   * Gets the start of the current tracking period (12pm of previous day)
   */
  const getTrackingPeriodStart = (): Date => {
    const now = getCurrentTime();
    const trackingStart = new Date(now);

    if (now.getHours() < TRACKING_PERIOD_START_HOUR) {
      trackingStart.setDate(now.getDate() - 1);
    }

    trackingStart.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
    return trackingStart;
  };

  /**
   * Gets the end of the current tracking period (11:59am of current day)
   */
  const getTrackingPeriodEnd = (): Date => {
    const now = getCurrentTime();
    const trackingEnd = new Date(now);

    if (now.getHours() >= TRACKING_PERIOD_START_HOUR) {
      trackingEnd.setDate(now.getDate() + 1);
    }

    trackingEnd.setHours(TRACKING_PERIOD_START_HOUR - 1, 59, 59, 999);
    return trackingEnd;
  };

  /**
   * Calculates hours worked in tracking period up to a specific time
   * Used to show hours worked before starting a new day
   */
  const calculateWorkTimeUpToTime = (
    entries: typeof dayState.entries,
    periodStart: Date,
    periodEnd: Date,
    upToTime: Date
  ): number => {
    let totalMinutes = 0;
    let clockInTime: Date | null = null;

    for (const entry of entries) {
      // Only process entries up to the specified time
      if (entry.timestamp > upToTime) {
        // If we have an active clock-in, count up to upToTime
        if (clockInTime) {
          const effectiveClockIn =
            clockInTime < periodStart ? periodStart : clockInTime;
          const effectiveClockOut = upToTime > periodEnd ? periodEnd : upToTime;
          if (effectiveClockOut > effectiveClockIn) {
            const diffMs =
              effectiveClockOut.getTime() - effectiveClockIn.getTime();
            totalMinutes += Math.floor(diffMs / (1000 * 60));
          }
          clockInTime = null;
        }
        break;
      }

      if (entry.type === "clock-in") {
        clockInTime = entry.timestamp;
      } else if (entry.type === "clock-out" && clockInTime) {
        // Calculate the effective clock-in time (use period start if before period)
        const effectiveClockIn =
          clockInTime < periodStart ? periodStart : clockInTime;
        // Calculate the effective clock-out time (use period end if after period, or upToTime if after that)
        let effectiveClockOut = entry.timestamp;
        if (effectiveClockOut > periodEnd) {
          effectiveClockOut = periodEnd;
        }
        if (effectiveClockOut > upToTime) {
          effectiveClockOut = upToTime;
        }

        // Only count if clock-out is after clock-in
        if (effectiveClockOut > effectiveClockIn) {
          const diffMs =
            effectiveClockOut.getTime() - effectiveClockIn.getTime();
          totalMinutes += Math.floor(diffMs / (1000 * 60));
        }
        clockInTime = null;
      }
    }

    // If there's still an active clock-in at the end, count up to upToTime
    if (clockInTime) {
      const effectiveClockIn =
        clockInTime < periodStart ? periodStart : clockInTime;
      const effectiveClockOut = upToTime > periodEnd ? periodEnd : upToTime;
      if (effectiveClockOut > effectiveClockIn) {
        const diffMs = effectiveClockOut.getTime() - effectiveClockIn.getTime();
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    }

    return totalMinutes;
  };

  /**
   * Gets target hours for the day that ends the tracking period
   */
  const getTargetHoursForTrackingPeriod = (): number => {
    const periodEnd = getTrackingPeriodEnd();
    const dayOfWeek = periodEnd.getDay();
    return DAILY_HOUR_TARGETS[dayOfWeek] || 0;
  };

  /**
   * Calculates current work time in tracking period
   */
  const calculateWorkTimeInTrackingPeriod = (): number => {
    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();
    const now = getCurrentTime();
    return calculateWorkTimeUpToTime(
      dayState.entries,
      periodStart,
      periodEnd,
      now
    );
  };

  /**
   * Checks if an entry crosses the 12pm tracking period boundary
   * Returns the boundary date if crossed, null otherwise
   * The boundary is shown BEFORE the entry that crosses it
   */
  const getTrackingPeriodBoundary = (
    entry: Date,
    nextEntry?: Date
  ): Date | null => {
    if (!nextEntry) {
      return null; // Can't determine boundary without next entry
    }

    const entryHour = entry.getHours();
    const entryDate = entry.getDate();
    const nextHour = nextEntry.getHours();
    const nextDate = nextEntry.getDate();
    const daysDiff = nextDate - entryDate;

    // Case 1: Entry before 12pm, next entry after 12pm on same day
    if (
      entryHour < TRACKING_PERIOD_START_HOUR &&
      nextHour >= TRACKING_PERIOD_START_HOUR &&
      daysDiff === 0
    ) {
      const boundary = new Date(entry);
      boundary.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
      return boundary;
    }

    // Case 2: Entry after 12pm, next entry before 12pm next day (crosses midnight boundary)
    if (
      entryHour >= TRACKING_PERIOD_START_HOUR &&
      nextHour < TRACKING_PERIOD_START_HOUR &&
      daysDiff === 1
    ) {
      const boundary = new Date(nextEntry);
      boundary.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
      boundary.setDate(boundary.getDate() - 1);
      return boundary;
    }

    // Case 3: Entry before 12pm, next entry after 12pm next day (spans full day)
    if (entryHour < TRACKING_PERIOD_START_HOUR && daysDiff > 0) {
      // Check if there's a 12pm boundary in between
      const boundary = new Date(entry);
      boundary.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
      if (boundary.getTime() < nextEntry.getTime()) {
        return boundary;
      }
    }

    return null;
  };

  /**
   * Calculates hours worked in a tracking period up to a boundary
   * Handles entries that span the boundary (e.g., clock-in before 12pm, clock-out after 12pm)
   */
  const calculateHoursUpToBoundary = (
    entries: typeof dayState.entries,
    boundaryDate: Date
  ): number => {
    let totalMinutes = 0;
    let clockInTime: Date | null = null;

    for (const entry of entries) {
      if (entry.type === "clock-in") {
        clockInTime = entry.timestamp;
      } else if (entry.type === "clock-out" && clockInTime) {
        // If clock-in is before boundary and clock-out is after boundary,
        // count only the time from clock-in to boundary
        if (clockInTime < boundaryDate && entry.timestamp > boundaryDate) {
          const diffMs = boundaryDate.getTime() - clockInTime.getTime();
          totalMinutes += Math.floor(diffMs / (1000 * 60));
        } else if (entry.timestamp <= boundaryDate) {
          // Both are before or at boundary, count full duration
          const diffMs = entry.timestamp.getTime() - clockInTime.getTime();
          totalMinutes += Math.floor(diffMs / (1000 * 60));
        }
        // If both are after boundary, don't count (already in new period)
        clockInTime = null;
      }
    }

    // If there's an active clock-in that extends to boundary, count it
    if (clockInTime && clockInTime < boundaryDate) {
      const diffMs = boundaryDate.getTime() - clockInTime.getTime();
      totalMinutes += Math.floor(diffMs / (1000 * 60));
    }

    return totalMinutes;
  };

  const getDurationForEntry = (entry: any, index: number): string => {
    const isLatestRow = index === dayState.entries.length - 1;

    // For the latest row, if it's a clock-in, show live duration
    if (isLatestRow && entry.type === "clock-in") {
      const now = getCurrentTime();
      const diffMs = now.getTime() - entry.timestamp.getTime();
      const minutes = Math.round(diffMs / (1000 * 60));
      return formatDuration(minutes);
    }

    // For all other rows, calculate duration to the next row
    const nextEntry = dayState.entries[index + 1];
    if (nextEntry) {
      const diffMs = nextEntry.timestamp.getTime() - entry.timestamp.getTime();
      const minutes = Math.round(diffMs / (1000 * 60));
      return formatDuration(minutes);
    }

    return "";
  };

  const currentDate = dayState.dayDate
    ? formatDate(dayState.dayDate)
    : formatDate(getCurrentTime());

  const handleStartDayClick = () => {
    if (dayState.entries.length > 0) {
      setShowConfirmDialog(true);
    } else {
      // Calculate hours worked in current tracking period before starting
      const now = getCurrentTime();
      const periodStart = getTrackingPeriodStart();
      const periodEnd = getTrackingPeriodEnd();
      const hoursWorked = calculateWorkTimeUpToTime(
        dayState.entries,
        periodStart,
        periodEnd,
        now
      );

      if (hoursWorked > 0) {
        setPreviousPeriodHours({
          hours: hoursWorked,
          periodStart,
          periodEnd,
        });
        setShowPreviousPeriodCard(true);
      }

      onStartDay(false);
    }
  };

  const handleConfirmStartNewDay = () => {
    // Calculate hours worked in current tracking period before starting
    const now = getCurrentTime();
    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();
    const hoursWorked = calculateWorkTimeUpToTime(
      dayState.entries,
      periodStart,
      periodEnd,
      now
    );

    if (hoursWorked > 0) {
      setPreviousPeriodHours({
        hours: hoursWorked,
        periodStart,
        periodEnd,
      });
      setShowPreviousPeriodCard(true);
    }

    onStartDay(true);
    setShowConfirmDialog(false);
  };

  const handleCancelStartNewDay = () => {
    setShowConfirmDialog(false);
  };

  const handleToggleEntryClick = (entryId: string) => {
    onToggleEntry(entryId);
  };

  const handleEditEntryClick = (entryId: string) => {
    const entry = dayState.entries.find((e) => e.id === entryId);
    if (entry) {
      setEditingEntryId(entryId);
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const date = entry.timestamp;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      setEditDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingEntryId && editDateTime) {
      const newTimestamp = new Date(editDateTime);
      onUpdateEntry(editingEntryId, newTimestamp);
      setShowEditDialog(false);
      setEditingEntryId(null);
      setEditDateTime("");
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingEntryId(null);
    setEditDateTime("");
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    entryId: string
  ) => {
    setMenuAnchor({ element: event.currentTarget, entryId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuEdit = () => {
    if (menuAnchor) {
      handleEditEntryClick(menuAnchor.entryId);
      handleMenuClose();
    }
  };

  const handleMenuDelete = () => {
    if (menuAnchor) {
      setDeletingEntryId(menuAnchor.entryId);
      setShowDeleteDialog(true);
      handleMenuClose();
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEntryId) {
      onDeleteEntry(deletingEntryId);
      setShowDeleteDialog(false);
      setDeletingEntryId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingEntryId(null);
  };

  // Shared work time calculation logic
  const calculateWorkTime = (): number => {
    return calculateWorkTimeInTrackingPeriod();
  };

  const calculateBreakTime = (): number => {
    if (!dayState.startTime || dayState.entries.length === 0) {
      return 0;
    }

    let totalBreakMinutes = 0;
    let clockOutTime: Date | null = null;
    const now = getCurrentTime();

    for (const entry of dayState.entries) {
      if (entry.type === "clock-out") {
        clockOutTime = entry.timestamp;
      } else if (entry.type === "clock-in" && clockOutTime) {
        const diffMs = entry.timestamp.getTime() - clockOutTime.getTime();
        totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
        clockOutTime = null;
      }
    }

    // If the last entry is a clock-out, add the current break time
    if (clockOutTime) {
      const diffMs = now.getTime() - clockOutTime.getTime();
      totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
    }

    return totalBreakMinutes;
  };

  const getTotalWorkTime = (): string => {
    return formatDuration(calculateWorkTime());
  };

  const getTotalBreakTime = (): string => {
    return formatDuration(calculateBreakTime());
  };

  /**
   * Gets the absolute latest time to clock out to avoid overtime
   */
  const getLatestClockOutTime = (): {
    time: Date;
    isOvertime: boolean;
  } | null => {
    const targetHours = getTargetHoursForTrackingPeriod();
    if (targetHours === 0) {
      return null; // No work expected on this day
    }

    const targetMinutes = targetHours * 60;
    const workedMinutes = calculateWorkTimeInTrackingPeriod();
    const remainingMinutes = targetMinutes - workedMinutes;

    // Find the last active clock-in
    let activeClockInTime: Date | null = null;
    for (let i = dayState.entries.length - 1; i >= 0; i--) {
      if (dayState.entries[i].type === "clock-in") {
        const hasLaterClockOut = dayState.entries
          .slice(i + 1)
          .some((e) => e.type === "clock-out");
        if (!hasLaterClockOut) {
          activeClockInTime = dayState.entries[i].timestamp;
          break;
        }
      }
    }

    if (!activeClockInTime) {
      return null; // Not currently clocked in
    }

    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();

    // Adjust clock-in time if it's before the period start
    const effectiveClockIn =
      activeClockInTime < periodStart ? periodStart : activeClockInTime;

    // Calculate when they need to clock out
    const latestClockOut = new Date(
      effectiveClockIn.getTime() + remainingMinutes * 60 * 1000
    );

    // Don't allow clock-out beyond the tracking period end
    const finalClockOut =
      latestClockOut > periodEnd ? periodEnd : latestClockOut;

    const now = getCurrentTime();
    const isOvertime = finalClockOut.getTime() <= now.getTime();

    return {
      time: finalClockOut,
      isOvertime,
    };
  };

  const getClockOutTime = (): string => {
    const targetHours = getTargetHoursForTrackingPeriod();
    if (targetHours === 0) {
      return "No work scheduled";
    }

    const latestClockOut = getLatestClockOutTime();
    if (!latestClockOut) {
      return "Not clocked in";
    }

    if (latestClockOut.isOvertime) {
      return "⚠️ OVERTIME - Clock out immediately!";
    }

    const now = getCurrentTime();
    const timeUntilDeadline = latestClockOut.time.getTime() - now.getTime();
    const minutesUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60));

    if (minutesUntilDeadline <= 15) {
      return `⚠️ ${latestClockOut.time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} - Clock out soon!`;
    }

    return latestClockOut.time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
    >
      {/* Date Header */}
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          textAlign: "center",
          mb: 1,
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        {currentDate}
      </Typography>

      {/* Previous Period Hours Card - shows hours worked before current clock-in */}
      {showPreviousPeriodCard && previousPeriodHours && (
        <Card
          sx={{
            border: "2px solid",
            borderColor: "warning.main",
            backgroundColor: "warning.light",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "warning.contrastText",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccessTime />
                Hours Already Worked in This Tracking Period
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "warning.contrastText",
                }}
              >
                {formatDuration(previousPeriodHours.hours)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.contrastText",
                  opacity: 0.9,
                }}
              >
                Tracking Period:{" "}
                {previousPeriodHours.periodStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                12pm -{" "}
                {previousPeriodHours.periodEnd.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                11:59am
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "warning.contrastText",
                  opacity: 0.9,
                }}
              >
                Target: {getTargetHoursForTrackingPeriod()}h | Remaining:{" "}
                {formatDuration(
                  Math.max(
                    0,
                    getTargetHoursForTrackingPeriod() * 60 -
                      previousPeriodHours.hours
                  )
                )}
              </Typography>
              <Button
                onClick={() => {
                  setShowPreviousPeriodCard(false);
                  setPreviousPeriodHours(null);
                }}
                variant="outlined"
                size="small"
                sx={{
                  mt: 1,
                  alignSelf: "flex-start",
                  borderColor: "warning.contrastText",
                  color: "warning.contrastText",
                  "&:hover": {
                    borderColor: "warning.contrastText",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Dismiss
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card>
        <CardHeader
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
            "& .MuiCardHeader-action": {
              alignSelf: { xs: "stretch", sm: "center" },
              margin: 0,
              padding: 0,
              width: { xs: "100%", sm: "auto" },
            },
          }}
          title={
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Work Hours Tracker
            </Typography>
          }
          action={
            !dayState.isActive ? (
              <Button
                onClick={handleStartDayClick}
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                size="large"
                fullWidth
                sx={{
                  minHeight: { xs: 48, sm: 36 },
                  fontSize: { xs: "1rem", sm: "0.875rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Start New Day
              </Button>
            ) : (
              <Button
                onClick={onEndDay}
                variant="contained"
                color="error"
                startIcon={<Stop />}
                size="large"
                fullWidth
                sx={{
                  minHeight: { xs: 48, sm: 36 },
                  fontSize: { xs: "1rem", sm: "0.875rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                End Day
              </Button>
            )
          }
        />

        {/* Work Time stats cards display */}
        {dayState.entries.length > 0 && (
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Total Time Worked Card */}
              <Alert
                severity="info"
                icon={<AccessTime />}
                sx={{
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiAlert-icon": {
                    color: "primary.contrastText",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Time Worked: {getTotalWorkTime()}
                  </Typography>
                </Box>
              </Alert>

              {/* Total Break Time Card */}
              <Alert
                severity="warning"
                icon={<Coffee />}
                sx={{
                  backgroundColor: "warning.light",
                  color: "warning.contrastText",
                  "& .MuiAlert-icon": {
                    color: "warning.contrastText",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Break Time: {getTotalBreakTime()}
                  </Typography>
                </Box>
              </Alert>

              {/* Clock Out Time Card - Made more prominent */}
              <Alert
                severity={(() => {
                  const latestClockOut = getLatestClockOutTime();
                  if (!latestClockOut) return "info";
                  if (latestClockOut.isOvertime) return "error";
                  const now = getCurrentTime();
                  const minutesUntil = Math.floor(
                    (latestClockOut.time.getTime() - now.getTime()) /
                      (1000 * 60)
                  );
                  return minutesUntil <= 15 ? "warning" : "success";
                })()}
                icon={<Schedule />}
                sx={{
                  backgroundColor: (() => {
                    const latestClockOut = getLatestClockOutTime();
                    if (!latestClockOut) return "info.light";
                    if (latestClockOut.isOvertime) return "error.light";
                    const now = getCurrentTime();
                    const minutesUntil = Math.floor(
                      (latestClockOut.time.getTime() - now.getTime()) /
                        (1000 * 60)
                    );
                    return minutesUntil <= 15
                      ? "warning.light"
                      : "success.light";
                  })(),
                  color: (() => {
                    const latestClockOut = getLatestClockOutTime();
                    if (!latestClockOut) return "info.contrastText";
                    if (latestClockOut.isOvertime) return "error.contrastText";
                    const now = getCurrentTime();
                    const minutesUntil = Math.floor(
                      (latestClockOut.time.getTime() - now.getTime()) /
                        (1000 * 60)
                    );
                    return minutesUntil <= 15
                      ? "warning.contrastText"
                      : "success.contrastText";
                  })(),
                  "& .MuiAlert-icon": {
                    color: (() => {
                      const latestClockOut = getLatestClockOutTime();
                      if (!latestClockOut) return "info.contrastText";
                      if (latestClockOut.isOvertime)
                        return "error.contrastText";
                      const now = getCurrentTime();
                      const minutesUntil = Math.floor(
                        (latestClockOut.time.getTime() - now.getTime()) /
                          (1000 * 60)
                      );
                      return minutesUntil <= 15
                        ? "warning.contrastText"
                        : "success.contrastText";
                    })(),
                  },
                  border: (() => {
                    const latestClockOut = getLatestClockOutTime();
                    if (!latestClockOut) return "none";
                    if (latestClockOut.isOvertime) return "3px solid";
                    const now = getCurrentTime();
                    const minutesUntil = Math.floor(
                      (latestClockOut.time.getTime() - now.getTime()) /
                        (1000 * 60)
                    );
                    return minutesUntil <= 15 ? "3px solid" : "none";
                  })(),
                  borderColor: (() => {
                    const latestClockOut = getLatestClockOutTime();
                    if (!latestClockOut) return "transparent";
                    if (latestClockOut.isOvertime) return "error.main";
                    return "warning.main";
                  })(),
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  fontWeight: "bold",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Must Clock Out By: {getClockOutTime()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Tracking Period:{" "}
                    {(() => {
                      const start = getTrackingPeriodStart();
                      const end = getTrackingPeriodEnd();
                      return `${start.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} 12pm - ${end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} 11:59am`;
                    })()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Target: {getTargetHoursForTrackingPeriod()}h | Worked:{" "}
                    {formatDuration(calculateWorkTimeInTrackingPeriod())}
                  </Typography>
                </Box>
              </Alert>
            </Box>
          </CardContent>
        )}
      </Card>

      {/* Time entries list */}
      {dayState.entries.length > 0 && (
        <Card>
          <CardHeader
            title={
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Time Entries ({currentDate})
              </Typography>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {dayState.entries.map((entry, index) => {
                const isLatestEntry = index === dayState.entries.length - 1;
                const showClockBackIn =
                  !dayState.isActive &&
                  isLatestEntry &&
                  entry.type === "clock-out";
                const duration = getDurationForEntry(entry, index);
                const nextEntry = dayState.entries[index + 1];
                // Check if the current entry and next entry cross a boundary
                const boundary = nextEntry
                  ? getTrackingPeriodBoundary(
                      entry.timestamp,
                      nextEntry.timestamp
                    )
                  : null;
                // Calculate hours worked up to the boundary (including partial time from current entry if it spans boundary)
                const hoursBeforeBoundary = boundary
                  ? calculateHoursUpToBoundary(
                      dayState.entries.slice(0, index + 1),
                      boundary
                    )
                  : 0;

                return (
                  <React.Fragment key={entry.id}>
                    {/* Entry Row */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {/* Menu button - outside the row */}
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, entry.id)}
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "primary.main",
                            backgroundColor: "action.hover",
                          },
                          flexShrink: 0,
                        }}
                        aria-label="Entry options"
                      >
                        <MoreVert />
                      </IconButton>

                      {/* Row content */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flex: 1,
                          py: { xs: 1, sm: 1.25 },
                          px: { xs: 1.5, sm: 2 },
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          backgroundColor: "background.paper",
                          minHeight: 48,
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        {/* Left side - Time and Badge */}
                        <Box sx={{ flex: 0, minWidth: 120 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              minHeight: 32,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                                color:
                                  entry.type === "clock-in"
                                    ? "success.main"
                                    : "error.main",
                                lineHeight: 1,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {formatTime(entry.timestamp)}
                            </Typography>
                            <Chip
                              label={entry.type === "clock-in" ? "IN" : "OUT"}
                              color={
                                entry.type === "clock-in" ? "success" : "error"
                              }
                              variant="filled"
                              size="small"
                              sx={{
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                fontWeight: "bold",
                                height: { xs: 24, sm: 28 },
                                minWidth: 40,
                                justifyContent: "center",
                                alignSelf: "center",
                                transform: "translateY(-1px)",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Center - Duration and Reason */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1, // Take up remaining space to center better
                            maxWidth: 120, // Prevent it from getting too wide
                            mx: { xs: 1, sm: 1.5 },
                            minHeight: 48, // Match reduced row height
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            {duration && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                  fontWeight: "medium",
                                }}
                              >
                                {duration}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Right side - Action button */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flex: 0,
                            minWidth: 100, // Fixed width for consistent positioning
                            minHeight: 48, // Match reduced row height
                          }}
                        >
                          {showClockBackIn ? (
                            <Button
                              onClick={() => onStartDay(false)}
                              variant="contained"
                              color="success"
                              startIcon={<PlayArrow />}
                              size="medium"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                minHeight: { xs: 40, sm: 44 },
                                minWidth: 100, // Uniform width for all buttons
                                px: { xs: 2, sm: 3 },
                              }}
                            >
                              Back In
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleToggleEntryClick(entry.id)}
                              variant="outlined"
                              color={
                                entry.type === "clock-in" ? "error" : "success"
                              }
                              size="medium"
                              disabled={!isLatestEntry}
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                minHeight: { xs: 40, sm: 44 },
                                minWidth: 100, // Uniform width for all buttons
                                px: { xs: 2, sm: 3 },
                              }}
                            >
                              {entry.type === "clock-in"
                                ? "Clock Out"
                                : "Clock In"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Tracking Period Boundary Separator - shown after entry that crosses boundary */}
                    {boundary && (
                      <Box
                        sx={{
                          my: 2,
                          py: 2,
                          px: 2,
                          border: "2px dashed",
                          borderColor: "warning.main",
                          borderRadius: 2,
                          backgroundColor: "warning.dark",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color: "warning.contrastText",
                              textAlign: "center",
                            }}
                          >
                            ⚠️ Tracking Period Boundary Crossed
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "warning.contrastText",
                              fontWeight: "medium",
                            }}
                          >
                            {boundary.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at 12:00 PM
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "warning.contrastText",
                              opacity: 0.9,
                            }}
                          >
                            Hours accrued on previous time card:{" "}
                            <strong>
                              {formatDuration(hoursBeforeBoundary)}
                            </strong>
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "warning.contrastText",
                              opacity: 0.8,
                              textAlign: "center",
                              mt: 0.5,
                            }}
                          >
                            Entries below this line count toward the new
                            tracking period
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Entry Menu */}
      <Menu
        anchorEl={menuAnchor?.element || null}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuDelete}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Empty state */}
      {dayState.entries.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: { xs: 3, sm: 4 } }}>
            <AccessTime
              sx={{
                fontSize: { xs: 60, sm: 80 },
                color: "text.secondary",
                mb: { xs: 2, sm: 3 },
              }}
            />
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontWeight: "medium",
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Ready to start your work day?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: { xs: "100%", sm: 400 },
                mx: "auto",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                px: { xs: 2, sm: 0 },
              }}
            >
              Click "Start New Day" above to begin tracking your work hours for
              the day.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelStartNewDay}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="confirm-dialog-title"
          sx={{
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Start New Day?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="confirm-dialog-description"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            This will clear all existing time entries and start a fresh day.
            This action cannot be undone. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancelStartNewDay}
            color="primary"
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStartNewDay}
            color="error"
            variant="contained"
            autoFocus
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Start New Day
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={handleCancelEdit}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="edit-dialog-title"
          sx={{
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Edit Time Entry
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              mb: 3,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Update the date and time for this entry:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="datetime"
            label="Date & Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={editDateTime}
            onChange={(e) => setEditDateTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "1rem", sm: "1rem" },
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancelEdit}
            color="primary"
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            color="primary"
            variant="contained"
            autoFocus
            fullWidth
            disabled={!editDateTime}
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Delete Time Entry?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Are you sure you want to delete this time entry? This action cannot
            be undone and will affect your work hours calculations.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancelDelete}
            color="primary"
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
