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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  AccessTime,
  PlayArrow,
  Stop,
  Coffee,
  Schedule,
} from "@mui/icons-material";
import { DayState } from "../types";

interface WorkHoursTrackerProps {
  dayState: DayState;
  onStartDay: (clearExisting?: boolean) => void;
  onEndDay: () => void;
  onToggleEntry: (entryId: string, reason?: string) => void;
}

const CLOCK_OUT_REASONS = [
  { emoji: "🚗", label: "Commuting", value: "commuting" },
  { emoji: "🍜", label: "Lunch", value: "lunch" },
  { emoji: "📝", label: "Misc", value: "misc" },
];

export const WorkHoursTracker: React.FC<WorkHoursTrackerProps> = ({
  dayState,
  onStartDay,
  onEndDay,
  onToggleEntry,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showReasonDialog, setShowReasonDialog] = React.useState(false);
  const [disableReasonDialog, setDisableReasonDialog] = React.useState(false);
  const [pendingEntryId, setPendingEntryId] = React.useState<string | null>(
    null
  );
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDurationForEntry = (entry: any, index: number): string => {
    // Latest row never has duration - its session hasn't ended yet
    const isLatestRow = index === dayState.entries.length - 1;
    if (isLatestRow) {
      return "";
    }

    // For all other rows, calculate duration to the next row
    const nextEntry = dayState.entries[index + 1];
    if (nextEntry) {
      const diffMs = nextEntry.timestamp.getTime() - entry.timestamp.getTime();
      const minutes = Math.round(diffMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }

    return "";
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentDate = dayState.dayDate
    ? formatDate(dayState.dayDate)
    : formatDate(new Date());

  const handleStartDayClick = () => {
    if (dayState.entries.length > 0) {
      setShowConfirmDialog(true);
    } else {
      onStartDay(false);
    }
  };

  const handleConfirmStartNewDay = () => {
    onStartDay(true);
    setShowConfirmDialog(false);
  };

  const handleCancelStartNewDay = () => {
    setShowConfirmDialog(false);
  };

  const handleToggleEntryClick = (entryId: string) => {
    const entry = dayState.entries.find((e) => e.id === entryId);
    if (entry && entry.type === "clock-in" && !disableReasonDialog) {
      // Show reason dialog for clock-out
      setPendingEntryId(entryId);
      setShowReasonDialog(true);
    } else {
      // Direct toggle without reason dialog
      onToggleEntry(entryId);
    }
  };

  const handleReasonSelect = (reason: string) => {
    if (pendingEntryId) {
      onToggleEntry(pendingEntryId, reason);
    }
    setShowReasonDialog(false);
    setPendingEntryId(null);
  };

  const handleCancelReasonDialog = () => {
    setShowReasonDialog(false);
    setPendingEntryId(null);
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

    // No live time calculation - only completed sessions count
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getTotalBreakTime = (): string => {
    if (!dayState.startTime || dayState.entries.length === 0) {
      return "0h 0m";
    }

    let totalBreakMinutes = 0;
    let clockOutTime: Date | null = null;

    for (const entry of dayState.entries) {
      if (entry.type === "clock-out") {
        clockOutTime = entry.timestamp;
      } else if (entry.type === "clock-in" && clockOutTime) {
        const diffMs = entry.timestamp.getTime() - clockOutTime.getTime();
        totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
        clockOutTime = null;
      }
    }

    const hours = Math.floor(totalBreakMinutes / 60);
    const minutes = totalBreakMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getClockOutTime = (): string => {
    if (!dayState.startTime) {
      return "N/A";
    }

    const MAX_WORK_HOURS = 8;
    const MAX_WORK_MINUTES = MAX_WORK_HOURS * 60;

    // Calculate total work time in minutes (excluding breaks) - only completed sessions
    let totalWorkMinutes = 0;
    let clockInTime: Date | null = null;

    for (const entry of dayState.entries) {
      if (entry.type === "clock-in") {
        clockInTime = entry.timestamp;
      } else if (entry.type === "clock-out" && clockInTime) {
        const diffMs = entry.timestamp.getTime() - clockInTime.getTime();
        totalWorkMinutes += Math.floor(diffMs / (1000 * 60));
        clockInTime = null;
      }
    }

    // No live time calculation - only completed sessions count

    // Calculate remaining work time
    const remainingMinutes = MAX_WORK_MINUTES - totalWorkMinutes;

    if (remainingMinutes <= 0) {
      return "Should clock out now";
    }

    // Calculate the time when they must clock out
    // This should be current time + remaining work time
    const now = new Date();
    const clockOutTime = new Date(now.getTime() + remainingMinutes * 60 * 1000);

    return clockOutTime.toLocaleTimeString("en-US", {
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

              {/* Clock Out Time Card */}
              <Alert
                severity="success"
                icon={<Schedule />}
                sx={{
                  backgroundColor: "success.light",
                  color: "success.contrastText",
                  "& .MuiAlert-icon": {
                    color: "success.contrastText",
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
                    Must Clock Out By: {getClockOutTime()}
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
                const isMostRecent = index === dayState.entries.length - 1;
                const isLastEntry = index === dayState.entries.length - 1;
                const showClockBackIn =
                  !dayState.isActive &&
                  isLastEntry &&
                  entry.type === "clock-out";
                const duration = getDurationForEntry(entry, index);

                return (
                  <Box
                    key={entry.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: { xs: 1, sm: 1.25 }, // Reduced vertical padding
                      px: { xs: 1.5, sm: 2 }, // Keep horizontal padding
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      minHeight: 48, // Reduced from 60 to 48
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {/* Left side - Time, Badge, and Reason */}
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
                            minWidth: 40, // Equal width for both IN and OUT
                            justifyContent: "center",
                            alignSelf: "center",
                            transform: "translateY(-1px)", // Fine-tune to match timestamp visual center
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
                        {/* Reason indicator for clock-out entries */}
                        {entry.type === "clock-out" && entry.reason && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              mt: 0.25,
                            }}
                          >
                            {
                              CLOCK_OUT_REASONS.find(
                                (r) => r.value === entry.reason
                              )?.emoji
                            }{" "}
                            {
                              CLOCK_OUT_REASONS.find(
                                (r) => r.value === entry.reason
                              )?.label
                            }
                          </Typography>
                        )}
                        {entry.type === "clock-out" && !entry.reason && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              mt: 0.25,
                            }}
                          >
                            🌙 End of day
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
                          disabled={!isMostRecent}
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
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

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

      {/* Clock-out Reason Dialog */}
      <Dialog
        open={showReasonDialog}
        onClose={handleCancelReasonDialog}
        aria-labelledby="reason-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="reason-dialog-title"
          sx={{
            fontSize: { xs: "1.125rem", sm: "1.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Why are you clocking out?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              mb: 3,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            Please select a reason for clocking out:
          </DialogContentText>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            {CLOCK_OUT_REASONS.map((reason) => (
              <Button
                key={reason.value}
                fullWidth
                variant="outlined"
                onClick={() => handleReasonSelect(reason.value)}
                sx={{
                  height: { xs: 70, sm: 80 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  border: "2px solid",
                  borderColor: "primary.main",
                  minHeight: { xs: 44, sm: 80 },
                  "&:hover": {
                    backgroundColor: "primary.light",
                    borderColor: "primary.dark",
                  },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontSize: { xs: "2rem", sm: "2.125rem" } }}
                >
                  {reason.emoji}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                    fontSize: { xs: "0.875rem", sm: "0.875rem" },
                  }}
                >
                  {reason.label}
                </Typography>
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancelReasonDialog}
            color="primary"
            fullWidth
            sx={{
              minHeight: { xs: 44, sm: 36 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clock-out reason toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-start" },
          py: 1,
          px: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          backgroundColor: "background.paper",
          maxWidth: "fit-content",
          mx: { xs: "auto", sm: 0 },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={disableReasonDialog}
              onChange={(e) => setDisableReasonDialog(e.target.checked)}
              color="primary"
              size="small"
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Disable clock-out reason dialog
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>
    </Box>
  );
};
