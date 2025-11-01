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

interface WorkHoursTrackerProps {
  dayState: DayState;
  onStartDay: (clearExisting?: boolean) => void;
  onEndDay: () => void;
  onToggleEntry: (entryId: string, reason?: string) => void;
  onUpdateEntry: (entryId: string, newTimestamp: Date) => void;
  onDeleteEntry: (entryId: string) => void;
}

const CLOCK_OUT_REASONS = [
  { emoji: "🚗", label: "Commuting", value: "commuting" },
  { emoji: "🍜", label: "Lunch", value: "lunch" },
  { emoji: "📝", label: "Miscellaneous", value: "misc" },
];

export const WorkHoursTracker: React.FC<WorkHoursTrackerProps> = ({
  dayState,
  onStartDay,
  onEndDay,
  onToggleEntry,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showReasonDialog, setShowReasonDialog] = React.useState(false);
  const [disableReasonDialog, setDisableReasonDialog] = React.useState(false);
  const [pendingEntryId, setPendingEntryId] = React.useState<string | null>(
    null
  );
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
      return formatDuration(minutes);
    }

    return "";
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
    if (!dayState.startTime || dayState.entries.length === 0) {
      return 0;
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

    return totalMinutes;
  };

  const calculateBreakTime = (): number => {
    if (!dayState.startTime || dayState.entries.length === 0) {
      return 0;
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

    return totalBreakMinutes;
  };

  const getTotalWorkTime = (): string => {
    return formatDuration(calculateWorkTime());
  };

  const getTotalBreakTime = (): string => {
    return formatDuration(calculateBreakTime());
  };

  const getClockOutTime = (): string => {
    if (!dayState.startTime || dayState.entries.length === 0) {
      return "N/A";
    }

    const MAX_WORK_HOURS = 8;
    const MAX_WORK_MINUTES = MAX_WORK_HOURS * 60;
    const totalWorkMinutes = calculateWorkTime();
    const remainingMinutes = MAX_WORK_MINUTES - totalWorkMinutes;

    if (remainingMinutes <= 0) {
      return "Completed";
    }

    // Find the last active clock-in (most recent clock-in without a clock-out after it)
    let activeClockInTime: Date | null = null;

    for (let i = dayState.entries.length - 1; i >= 0; i--) {
      if (dayState.entries[i].type === "clock-in") {
        // Check if there's a clock-out after this clock-in
        const hasLaterClockOut = dayState.entries
          .slice(i + 1)
          .some((e) => e.type === "clock-out");

        if (!hasLaterClockOut) {
          activeClockInTime = dayState.entries[i].timestamp;
          break;
        }
      }
    }

    if (activeClockInTime) {
      // They're actively working - calculate when they must clock out
      const clockOutTime = new Date(
        activeClockInTime.getTime() + remainingMinutes * 60 * 1000
      );

      const now = new Date();
      if (clockOutTime.getTime() <= now.getTime()) {
        return "Should clock out now";
      }

      return clockOutTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // They're clocked out (on break) - calculate when they need to finish their 8 hours
      // This is the day start time + 8 hours
      const finishTime = new Date(
        dayState.startTime.getTime() + MAX_WORK_MINUTES * 60 * 1000
      );

      const now = new Date();
      if (finishTime.getTime() <= now.getTime()) {
        return "Should finish now";
      }

      return finishTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
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
                const isLatestEntry = index === dayState.entries.length - 1;
                const showClockBackIn =
                  !dayState.isActive &&
                  isLatestEntry &&
                  entry.type === "clock-out";
                const duration = getDurationForEntry(entry, index);

                return (
                  <Box
                    key={entry.id}
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
                          {/* Reason indicator for clock-out entries */}
                          {entry.type === "clock-out" &&
                            entry.reason &&
                            (() => {
                              const reason = CLOCK_OUT_REASONS.find(
                                (r) => r.value === entry.reason
                              );
                              return reason ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                    mt: 0.25,
                                  }}
                                >
                                  {reason.emoji} {reason.label}
                                </Typography>
                              ) : null;
                            })()}
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
                  flexDirection: "row",
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
                  variant="h6"
                  sx={{
                    fontWeight: "medium",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
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
