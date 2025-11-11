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
import { TimeSimulatorPanel } from "./TimeSimulatorPanel";

/**
 * Component: WorkHoursTrackerHeader
 * Contains the header card with title, tracking period info, start/end day buttons, and stats cards
 */
interface WorkHoursTrackerHeaderProps {
  dayState: DayState;
  isActive: boolean;
  onStartDayClick: () => void;
  onEndDayClick: () => void;
  formatTrackingPeriodLabel: () => string;
  getTotalWorkTime: () => string;
  getTotalBreakTimeInTrackingPeriod: () => string;
  getTargetHoursForTrackingPeriod: () => number;
  getRemainingMinutesInPayPeriod: () => number;
  getClockOutTime: () => string;
  calculateWorkTimeInTrackingPeriod: () => number;
  formatDuration: (minutes: number) => string;
  TrackingPeriodInfo: React.FC<{
    periodLabel: string;
    workedLabel: string;
    color: string;
  }>;
}

const WorkHoursTrackerHeader: React.FC<WorkHoursTrackerHeaderProps> = ({
  dayState,
  isActive,
  onStartDayClick,
  onEndDayClick,
  formatTrackingPeriodLabel,
  getTotalWorkTime,
  getTotalBreakTimeInTrackingPeriod,
  getTargetHoursForTrackingPeriod,
  getRemainingMinutesInPayPeriod,
  getClockOutTime,
  calculateWorkTimeInTrackingPeriod,
  formatDuration,
  TrackingPeriodInfo,
}) => {
  return (
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
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Work Hours Planner
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: "medium",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Plan your work schedule using simulated time: <br />
              <strong>{formatTrackingPeriodLabel()}</strong>
            </Typography>
          </>
        }
        action={
          !isActive ? (
            <Button
              onClick={onStartDayClick}
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
              onClick={onEndDayClick}
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
                  Time Clocked In: {getTotalWorkTime()}
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
                  Time Clocked Out: {getTotalBreakTimeInTrackingPeriod()}
                </Typography>
              </Box>
            </Alert>

            {/* Must Clock Out By Card */}
            {(() => {
              // Compute derived UI state once for the alert
              const hasSchedule = getTargetHoursForTrackingPeriod() > 0;
              const remainingMinutes = getRemainingMinutesInPayPeriod();
              const overtime = hasSchedule && remainingMinutes <= 0;
              const approaching =
                hasSchedule && remainingMinutes > 0 && remainingMinutes <= 60;
              const severity = !hasSchedule
                ? "info"
                : overtime
                ? "error"
                : approaching
                ? "warning"
                : "success";
              const bgColor = !hasSchedule
                ? "info.light"
                : overtime
                ? "error.light"
                : approaching
                ? "warning.light"
                : "success.light";
              const textColor = !hasSchedule
                ? "info.contrastText"
                : overtime
                ? "error.contrastText"
                : approaching
                ? "warning.contrastText"
                : "success.contrastText";
              const border =
                !hasSchedule || (!approaching && !overtime)
                  ? "none"
                  : "3px solid";
              const borderColor = !hasSchedule
                ? "transparent"
                : overtime
                ? "error.main"
                : "warning.main";

              return (
                <Alert
                  severity={
                    severity as "info" | "error" | "warning" | "success"
                  }
                  icon={<Schedule />}
                  sx={{
                    backgroundColor: bgColor,
                    color: textColor,
                    "& .MuiAlert-icon": {
                      color: textColor,
                    },
                    border,
                    borderColor,
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
                    {approaching && (
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        Approaching limit: ≤ 1 hour remaining to 9h
                      </Typography>
                    )}
                    {overtime && (
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        Overtime: over target for this pay period
                      </Typography>
                    )}
                    <TrackingPeriodInfo
                      periodLabel={formatTrackingPeriodLabel()}
                      workedLabel={formatDuration(
                        calculateWorkTimeInTrackingPeriod()
                      )}
                      color={textColor}
                    />
                  </Box>
                </Alert>
              );
            })()}
          </Box>
        </CardContent>
      )}
    </Card>
  );
};

// Component: TimeEntriesTable
// Contains the time entries list with bookend entries, boundary separators, and entry management
interface TimeEntriesTableProps {
  dayState: DayState;
  currentDate: string;
  startDayBookendEntry: {
    periodStart: Date;
    periodEnd: Date;
    totalMinutes: number;
  } | null;
  endDaySummary: {
    periodStart: Date;
    periodEnd: Date;
    totalMinutes: number;
  } | null;
  onStartDay: (clearExisting?: boolean) => void;
  onToggleEntry: (entryId: string) => void;
  handleMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    entryId: string
  ) => void;
  formatTime: (date: Date) => string;
  formatDuration: (minutes: number) => string;
  getDurationForEntry: (entry: any, index: number) => string;
  getTrackingPeriodBoundary: (entry: Date, nextEntry?: Date) => Date | null;
  getPayPeriodDayNumber: (periodStart: Date) => number;
  getCurrentTime: () => Date;
  renderVirtualEntryRow: (
    clockInTime: Date,
    clockOutTime: Date
  ) => React.ReactElement;
  renderVirtualBreakRow: (
    clockOutTime: Date,
    clockInTime: Date
  ) => React.ReactElement | null;
  renderBoundarySeparator: (boundary: Date) => React.ReactElement;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({
  dayState,
  currentDate,
  startDayBookendEntry,
  endDaySummary,
  onStartDay,
  onToggleEntry,
  handleMenuOpen,
  formatTime,
  formatDuration,
  getDurationForEntry,
  getTrackingPeriodBoundary,
  getPayPeriodDayNumber,
  getCurrentTime,
  renderVirtualEntryRow,
  renderVirtualBreakRow,
  renderBoundarySeparator,
}) => {
  if (dayState.entries.length === 0) {
    return null;
  }

  return (
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
          {/* Start Day Bookend Entry - shows previous period hours at start of new day */}
          {startDayBookendEntry &&
            (() => {
              const s = startDayBookendEntry;
              return (
                <>
                  {renderVirtualEntryRow(
                    s.periodStart,
                    getCurrentTime() < s.periodEnd
                      ? getCurrentTime()
                      : s.periodEnd
                  )}
                  <Box
                    sx={{
                      mb: 1,
                      py: 0.5,
                      px: 1.5,
                      backgroundColor: "info.dark",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "info.contrastText",
                        fontWeight: "medium",
                      }}
                    >
                      Day {getPayPeriodDayNumber(s.periodStart)}:{" "}
                      {formatDuration(s.totalMinutes)} worked in previous period
                      (still part of ongoing pay period)
                    </Typography>
                  </Box>
                </>
              );
            })()}

          {dayState.entries.map((entry, index) => {
            const isLatestEntry = index === dayState.entries.length - 1;
            const showClockBackIn =
              !dayState.isActive && isLatestEntry && entry.type === "clock-out";
            const duration = getDurationForEntry(entry, index);
            const nextEntry = dayState.entries[index + 1];
            // Check if the current entry and next entry cross a boundary
            const boundary = nextEntry
              ? getTrackingPeriodBoundary(entry.timestamp, nextEntry.timestamp)
              : null;

            // Check if this entry spans the boundary (clock-in before 12pm, clock-out after 12pm)
            const entrySpansBoundary =
              boundary &&
              entry.type === "clock-in" &&
              nextEntry &&
              nextEntry.type === "clock-out" &&
              entry.timestamp < boundary &&
              nextEntry.timestamp > boundary;

            // Create bookend entries if entry spans boundary
            const beforeBoundaryEntry = entrySpansBoundary
              ? {
                  clockIn: entry.timestamp,
                  clockOut: new Date(boundary.getTime() - 60000), // 11:59am
                }
              : null;
            const afterBoundaryEntry = entrySpansBoundary
              ? {
                  clockIn: boundary, // 12:00pm
                  clockOut: nextEntry.timestamp,
                }
              : null;

            return (
              <React.Fragment key={entry.id}>
                {/* Always show the original entry */}
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
                          onClick={() => onToggleEntry(entry.id)}
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
                          {entry.type === "clock-in" ? "Clock Out" : "Clock In"}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* If this entry spans boundary, insert bookend entries after it */}
                {entrySpansBoundary &&
                  beforeBoundaryEntry &&
                  afterBoundaryEntry &&
                  boundary && (
                    <>
                      {/* Before boundary bookend entry (shows forced clock-out at 11:59am) */}
                      {renderVirtualEntryRow(
                        beforeBoundaryEntry.clockIn,
                        beforeBoundaryEntry.clockOut
                      )}

                      {/* Tracking Period Boundary Separator */}
                      {renderBoundarySeparator(boundary)}

                      {/* After boundary bookend entry (shows forced clock-in at 12:00pm) */}
                      {renderVirtualEntryRow(
                        afterBoundaryEntry.clockIn,
                        afterBoundaryEntry.clockOut
                      )}
                    </>
                  )}

                {/* Tracking Period Boundary Separator - shown after entry that crosses boundary (for non-spanning boundaries) */}
                {boundary && !entrySpansBoundary && (
                  <>
                    {entry.type === "clock-out" &&
                      nextEntry &&
                      nextEntry.type === "clock-in" && (
                        <>
                          {renderVirtualBreakRow(
                            entry.timestamp,
                            new Date(boundary.getTime() - 60000)
                          )}
                        </>
                      )}
                    {renderBoundarySeparator(boundary)}
                    {entry.type === "clock-out" &&
                      nextEntry &&
                      nextEntry.type === "clock-in" && (
                        <>
                          {renderVirtualBreakRow(boundary, nextEntry.timestamp)}
                        </>
                      )}
                  </>
                )}
              </React.Fragment>
            );
          })}

          {/* Virtual boundary when the user crossed into a new pay period while clocked out (no next entry yet) */}
          {!dayState.isActive &&
            dayState.entries.length > 0 &&
            (() => {
              const last = dayState.entries[dayState.entries.length - 1];
              const now = getCurrentTime();
              const boundary = getTrackingPeriodBoundary(last.timestamp, now);
              if (!boundary) return null;
              return (
                <>
                  {/* Break before boundary */}
                  {last.type === "clock-out" &&
                    renderVirtualBreakRow(
                      last.timestamp,
                      new Date(boundary.getTime() - 60000)
                    )}
                  {renderBoundarySeparator(boundary)}
                  {/* If still clocked out, show break from boundary to now */}
                  {last.type === "clock-out" &&
                    renderVirtualBreakRow(boundary, now)}
                </>
              );
            })()}

          {/* End Day Summary - shows ongoing pay period time when day is ended */}
          {endDaySummary &&
            !dayState.isActive &&
            (() => {
              const s = endDaySummary;
              return (
                <>
                  <Box
                    sx={{
                      my: 2,
                      py: 1,
                      px: 2,
                      borderTop: "2px solid",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      Day Ended - Ongoing Pay Period Summary
                    </Typography>
                  </Box>
                  {renderVirtualEntryRow(s.periodStart, s.periodEnd)}
                  <Box
                    sx={{
                      mt: 1,
                      mb: 2,
                      py: 1,
                      px: 2,
                      backgroundColor: "info.dark",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "info.contrastText",
                        fontWeight: "medium",
                      }}
                    >
                      Total Time Worked in Ongoing Pay Period:{" "}
                      <strong>{formatDuration(s.totalMinutes)}</strong>
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "info.contrastText",
                        opacity: 0.9,
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      This time will carry over into the next day's pay period
                      (ends at 11:59am)
                    </Typography>
                  </Box>
                </>
              );
            })()}
        </Box>
      </CardContent>
    </Card>
  );
};

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
  const [startDayBookendEntry, setStartDayBookendEntry] = React.useState<{
    periodStart: Date;
    periodEnd: Date;
    totalMinutes: number;
  } | null>(null);
  const [endDaySummary, setEndDaySummary] = React.useState<{
    periodStart: Date;
    periodEnd: Date;
    totalMinutes: number;
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

  // Clear start day bookend when crossing into a new pay period
  React.useEffect(() => {
    if (!startDayBookendEntry) return;

    const now = getCurrentTime();
    // Clear the bookend only when we actually cross today's 12pm boundary,
    // or when there's an entry at/after today's 12pm.
    const todayNoon = new Date(now);
    todayNoon.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);

    const hasEntryAtOrAfterNoon = dayState.entries.some(
      (entry) => entry.timestamp >= todayNoon
    );

    if (now >= todayNoon || hasEntryAtOrAfterNoon) {
      setStartDayBookendEntry(null);
    }
  }, [dayState.entries, startDayBookendEntry]);

  // (moved below helper declarations) Detect crossing into a new pay period while clocked out and show summary bookend

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

  // Shared compact date-time formatter: "Sun. Nov. 16 12:00 PM"
  const formatDateTimeCompact = (date: Date): string => {
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${weekday}. ${month}. ${day} ${time}`;
  };

  // Formats the current tracking period as "Sun. Nov. 16 12:00 PM - Mon. Nov. 17 11:59 AM"
  const formatTrackingPeriodLabel = (): string => {
    const start = getTrackingPeriodStart();
    const end = getTrackingPeriodEnd();

    return `${formatDateTimeCompact(start)} - ${formatDateTimeCompact(end)}`;
  };

  // Local presentational component for the period info block inside the alert
  const TrackingPeriodInfo: React.FC<{
    periodLabel: string;
    workedLabel: string;
    color?: string;
  }> = ({ periodLabel, workedLabel, color }) => {
    return (
      <>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            color,
          }}
        >
          <strong>Current Pay Period:</strong> {periodLabel}
          <br />
          <strong>Current Time Worked:</strong> {workedLabel}
        </Typography>
      </>
    );
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
   * Returns remaining minutes that can be worked in the current pay period.
   */
  const getRemainingMinutesInPayPeriod = (): number => {
    const targetHours = getTargetHoursForTrackingPeriod();
    if (targetHours === 0) return 0;
    const workedMinutes = calculateWorkTimeInTrackingPeriod();
    const targetMinutes = targetHours * 60;
    return Math.max(0, targetMinutes - workedMinutes);
  };

  /**
   * Returns the must clock-out-by Date, capped at the period end, or null if not scheduled.
   */
  const getMustClockOutByDate = (): Date | null => {
    const targetHours = getTargetHoursForTrackingPeriod();
    if (targetHours === 0) return null;
    const remainingMinutes = getRemainingMinutesInPayPeriod();
    const now = getCurrentTime();
    const periodEnd = getTrackingPeriodEnd();
    const proposed = new Date(now.getTime() + remainingMinutes * 60 * 1000);
    return proposed.getTime() > periodEnd.getTime() ? periodEnd : proposed;
  };

  /**
   * Gets the day number for a pay period (Sun-Mon = Day 1, Mon-Tues = Day 2, etc.)
   */
  const getPayPeriodDayNumber = (periodStart: Date): number => {
    const dayOfWeek = periodStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Sun-Mon = Day 1, Mon-Tues = Day 2, ..., Sat-Sun = Day 7
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  };

  /**
   * Calculates current work time in tracking period
   * Includes previous period hours if they're part of the ongoing pay period
   */
  const calculateWorkTimeInTrackingPeriod = (): number => {
    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();
    const now = getCurrentTime();

    // Calculate work time from entries
    let totalMinutes = calculateWorkTimeUpToTime(
      dayState.entries,
      periodStart,
      periodEnd,
      now
    );

    // Add previous period hours if they exist
    // The bookend represents work done in the current tracking period before starting the day
    if (startDayBookendEntry) {
      totalMinutes += startDayBookendEntry.totalMinutes;
    }

    return totalMinutes;
  };

  // Detect crossing into a new pay period while clocked out and show summary bookend
  const lastPeriodStartRef = React.useRef<Date>(getTrackingPeriodStart());
  React.useEffect(() => {
    const currentStart = getTrackingPeriodStart();
    const lastStart = lastPeriodStartRef.current;
    if (currentStart.getTime() !== lastStart.getTime()) {
      lastPeriodStartRef.current = currentStart;
      // Only show a previous-period summary automatically if the user is clocked out
      if (!dayState.isActive) {
        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        previousStart.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
        const previousEnd = new Date(currentStart.getTime() - 1);
        const totalMinutes = calculateWorkTimeUpToTime(
          dayState.entries,
          previousStart,
          previousEnd,
          previousEnd
        );
        if (totalMinutes > 0) {
          setEndDaySummary({
            periodStart: previousStart,
            periodEnd: previousEnd,
            totalMinutes,
          });
        } else {
          setEndDaySummary(null);
        }
      } else {
        setEndDaySummary(null);
      }
    }
  });

  /**
   * Checks if an entry crosses the 12pm tracking period boundary
   * Returns the boundary date if crossed, null otherwise
   * The boundary is shown BEFORE the entry that crosses it
   * Only detects actual 12pm crossings, not just day changes
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

    // Case 2: Entry before 12pm, next entry after 12pm next day (spans full day)
    // This is the only cross-day case that matters - when we cross the 12pm threshold
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

  // calculateHoursUpToBoundary removed (no longer needed after compact boundary UI).

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

  /**
   * Renders a virtual entry row (for bookend entries that show how entries are split)
   * Matches the exact layout and styling of normal entries, differentiated by border color
   */
  const renderVirtualEntryRow = (clockInTime: Date, clockOutTime: Date) => {
    const diffMs = clockOutTime.getTime() - clockInTime.getTime();
    const minutes = Math.round(diffMs / (1000 * 60));
    const duration = formatDuration(minutes);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Row content - matches normal entry layout exactly */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            py: { xs: 1, sm: 1.25 },
            px: { xs: 1.5, sm: 2 },
            border: "2px dashed",
            borderColor: "warning.main",
            borderRadius: 2,
            backgroundColor: "background.paper",
            minHeight: 48,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {/* Left side - Clock In Time and Badge */}
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
                  color: "success.main",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formatTime(clockInTime)}
              </Typography>
              <Chip
                label="IN"
                color="success"
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

          {/* Center - Duration */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              maxWidth: 120,
              mx: { xs: 1, sm: 1.5 },
              minHeight: 48,
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

          {/* Right side - Clock Out Time and Badge (matches button width) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flex: 0,
              minWidth: 100,
              minHeight: 48,
            }}
          >
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
                  color: "error.main",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formatTime(clockOutTime)}
              </Typography>
              <Chip
                label="OUT"
                color="error"
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
        </Box>
      </Box>
    );
  };

  /**
   * Renders a virtual break row (OUT to IN) to visualize non-working segments,
   * for example when a boundary is crossed while clocked out.
   */
  const renderVirtualBreakRow = (clockOutTime: Date, clockInTime: Date) => {
    if (clockInTime <= clockOutTime) return null;
    const diffMs = clockInTime.getTime() - clockOutTime.getTime();
    const minutes = Math.round(diffMs / (1000 * 60));
    const duration = formatDuration(minutes);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Spacer for menu button - matches normal entry */}
        <Box sx={{ width: 40, flexShrink: 0 }} />

        {/* Row content - similar to virtual entry layout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            py: { xs: 1, sm: 1.25 },
            px: { xs: 1.5, sm: 2 },
            border: "2px dashed",
            borderColor: "warning.main",
            borderRadius: 2,
            backgroundColor: "background.paper",
            minHeight: 48,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {/* Left side - Clock Out Time and Badge */}
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
                  color: "error.main",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formatTime(clockOutTime)}
              </Typography>
              <Chip
                label="OUT"
                color="error"
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

          {/* Center - Duration */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              maxWidth: 120,
              mx: { xs: 1, sm: 1.5 },
              minHeight: 48,
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

          {/* Right side - Clock In Time and Badge */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flex: 0,
              minWidth: 100,
              minHeight: 48,
            }}
          >
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
                  color: "success.main",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {formatTime(clockInTime)}
              </Typography>
              <Chip
                label="IN"
                color="success"
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
        </Box>
      </Box>
    );
  };

  const getPeriodBoundsFromBoundary = (boundary: Date) => {
    const previousStart = new Date(boundary);
    previousStart.setDate(previousStart.getDate() - 1);
    previousStart.setHours(TRACKING_PERIOD_START_HOUR, 0, 0, 0);
    const previousEnd = new Date(boundary);
    previousEnd.setHours(TRACKING_PERIOD_START_HOUR - 1, 59, 0, 0);
    const newStart = new Date(boundary);
    const newEnd = new Date(boundary);
    newEnd.setDate(newEnd.getDate() + 1);
    newEnd.setHours(TRACKING_PERIOD_START_HOUR - 1, 59, 0, 0);
    return { previousStart, previousEnd, newStart, newEnd };
  };

  const renderBoundarySeparator = (boundary: Date) => {
    const { previousStart, previousEnd, newStart, newEnd } =
      getPeriodBoundsFromBoundary(boundary);

    return (
      <Box
        sx={{
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
            ⚠️ New Pay Period Started ⚠️
          </Typography>
          {/* <Typography
            variant="body2"
            sx={{
              color: "black",
              fontSize: { xs: "0.875rem", sm: "0.95rem" },
              letterSpacing: 0.05,
              textAlign: "center",
            }}
          >
            <strong>Time Worked: {formatDuration(hoursBeforeBoundary)}</strong>
          </Typography> */}
          <Box sx={{ textAlign: "left", mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "warning.contrastText",
                opacity: 0.95,
              }}
            >
              <strong>Previous:</strong> {formatDateTimeCompact(previousStart)}{" "}
              - {formatDateTimeCompact(previousEnd)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "warning.contrastText",
                opacity: 0.95,
              }}
            >
              <strong>New:</strong> {formatDateTimeCompact(newStart)} -{" "}
              {formatDateTimeCompact(newEnd)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const currentDate = dayState.dayDate
    ? formatDate(dayState.dayDate)
    : formatDate(getCurrentTime());

  const handleStartDayClick = () => {
    // Clear end day summary when starting a new day
    setEndDaySummary(null);

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
        // Set bookend entry to show at start of entries list
        setStartDayBookendEntry({
          periodStart,
          periodEnd,
          totalMinutes: hoursWorked,
        });
      } else {
        setStartDayBookendEntry(null);
      }

      onStartDay(false);
    }
  };

  const handleConfirmStartNewDay = () => {
    // Clear end day summary when starting a new day
    setEndDaySummary(null);

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
      // Set bookend entry to show at start of entries list
      setStartDayBookendEntry({
        periodStart,
        periodEnd,
        totalMinutes: hoursWorked,
      });
    } else {
      setStartDayBookendEntry(null);
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

  const handleEndDayClick = () => {
    const now = getCurrentTime();
    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();

    // Check if pay period is still ongoing (hasn't reached 11:59am of current day)
    if (now < periodEnd) {
      // Calculate total time worked in the ongoing pay period
      const totalMinutes = calculateWorkTimeInTrackingPeriod();

      // Set the summary to display as a bookend entry
      setEndDaySummary({
        periodStart,
        periodEnd,
        totalMinutes,
      });
    }

    // Call the original onEndDay handler
    onEndDay();
  };

  // Shared work time calculation logic
  const calculateWorkTime = (): number => {
    return calculateWorkTimeInTrackingPeriod();
  };

  // (Deprecated) Daily break-time calculator removed in favor of pay-period based calculation.

  /**
   * Calculates break time for the current tracking period (12pm → 11:59am)
   * Counts only clocked-out segments that fall within the pay period window.
   */
  const calculateBreakTimeInTrackingPeriod = (): number => {
    if (dayState.entries.length === 0) {
      return 0;
    }

    const now = getCurrentTime();
    const periodStart = getTrackingPeriodStart();
    const periodEnd = getTrackingPeriodEnd();

    let totalBreakMinutes = 0;
    let clockOutTime: Date | null = null;

    for (const entry of dayState.entries) {
      if (entry.type === "clock-out") {
        clockOutTime = entry.timestamp;
      } else if (entry.type === "clock-in" && clockOutTime) {
        const effectiveOut =
          clockOutTime < periodStart ? periodStart : clockOutTime;
        let effectiveIn = entry.timestamp;
        if (effectiveIn > periodEnd) effectiveIn = periodEnd;
        if (effectiveIn > now) effectiveIn = now;
        if (effectiveIn > effectiveOut) {
          const diffMs = effectiveIn.getTime() - effectiveOut.getTime();
          totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
        }
        clockOutTime = null;
      }
    }

    // If still clocked out, add the ongoing break segment up to now or period end
    if (clockOutTime) {
      const effectiveOut =
        clockOutTime < periodStart ? periodStart : clockOutTime;
      const effectiveIn = now > periodEnd ? periodEnd : now;
      if (effectiveIn > effectiveOut) {
        const diffMs = effectiveIn.getTime() - effectiveOut.getTime();
        totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
      }
    }

    return totalBreakMinutes;
  };

  const getTotalWorkTime = (): string => {
    return formatDuration(calculateWorkTime());
  };

  const getTotalBreakTimeInTrackingPeriod = (): string => {
    return formatDuration(calculateBreakTimeInTrackingPeriod());
  };

  // (Deprecated) getLatestClockOutTime removed; consolidated logic uses remaining minutes and must-clock-out-by helpers.

  const getClockOutTime = (): string => {
    const targetHours = getTargetHoursForTrackingPeriod();
    if (targetHours === 0) {
      return "No work scheduled";
    }

    // Consolidated helpers for remaining time and must-clock-out deadline
    const mustClockOutBy = getMustClockOutByDate();
    if (!mustClockOutBy) {
      return "No work scheduled";
    }

    return mustClockOutBy.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 2 } }}
    >
      {/* Time Simulator Panel - Always visible */}
      <TimeSimulatorPanel />

      {/* Date Header */}
      {/* <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          textAlign: "center",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          fontWeight: "bold",
        }}
      >
        {currentDate}
      </Typography> */}

      {/* Header Card */}
      <WorkHoursTrackerHeader
        dayState={dayState}
        isActive={dayState.isActive}
        onStartDayClick={handleStartDayClick}
        onEndDayClick={handleEndDayClick}
        formatTrackingPeriodLabel={formatTrackingPeriodLabel}
        getTotalWorkTime={getTotalWorkTime}
        getTotalBreakTimeInTrackingPeriod={getTotalBreakTimeInTrackingPeriod}
        getTargetHoursForTrackingPeriod={getTargetHoursForTrackingPeriod}
        getRemainingMinutesInPayPeriod={getRemainingMinutesInPayPeriod}
        getClockOutTime={getClockOutTime}
        calculateWorkTimeInTrackingPeriod={calculateWorkTimeInTrackingPeriod}
        formatDuration={formatDuration}
        TrackingPeriodInfo={TrackingPeriodInfo}
      />

      {/* Time entries list */}
      <TimeEntriesTable
        dayState={dayState}
        currentDate={currentDate}
        startDayBookendEntry={startDayBookendEntry}
        endDaySummary={endDaySummary}
        onStartDay={onStartDay}
        onToggleEntry={handleToggleEntryClick}
        handleMenuOpen={handleMenuOpen}
        formatTime={formatTime}
        formatDuration={formatDuration}
        getDurationForEntry={getDurationForEntry}
        getTrackingPeriodBoundary={getTrackingPeriodBoundary}
        getPayPeriodDayNumber={getPayPeriodDayNumber}
        getCurrentTime={getCurrentTime}
        renderVirtualEntryRow={renderVirtualEntryRow}
        renderVirtualBreakRow={renderVirtualBreakRow}
        renderBoundarySeparator={renderBoundarySeparator}
      />

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
              Ready to plan your work day?
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
              Use the time simulator above to set your desired time, then click
              "Start New Day" to begin planning your work schedule.
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
