import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { AccessTime, PlayArrow, Stop } from "@mui/icons-material";
import { DayState } from "../types";

interface WorkHoursTrackerProps {
  dayState: DayState;
  onStartDay: (clearExisting?: boolean) => void;
  onEndDay: () => void;
  onToggleEntry: (entryId: string) => void;
}

export const WorkHoursTracker: React.FC<WorkHoursTrackerProps> = ({
  dayState,
  onStartDay,
  onEndDay,
  onToggleEntry,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Date Header */}
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ textAlign: "center", mb: 1 }}
      >
        {currentDate}
      </Typography>

      {/* Header Card */}
      <Card>
        <CardHeader
          sx={{
            "& .MuiCardHeader-action": {
              alignSelf: "center",
              margin: 0,
              padding: 0,
            },
          }}
          title={
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
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
              >
                End Day
              </Button>
            )
          }
        />

        {/* Total work time display */}
        {dayState.entries.length > 0 && (
          <CardContent sx={{ pt: 0 }}>
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
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  Total Work Time Today:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {getTotalWorkTime()}
                </Typography>
              </Box>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Time entries table */}
      {dayState.entries.length > 0 && (
        <Card>
          <CardHeader
            title={
              <Typography variant="h6">Time Entries ({currentDate})</Typography>
            }
          />
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayState.entries.map((entry, index) => {
                  const isMostRecent = index === dayState.entries.length - 1;
                  const isLastEntry = index === dayState.entries.length - 1;
                  const showClockBackIn =
                    !dayState.isActive &&
                    isLastEntry &&
                    entry.type === "clock-out";

                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell component="th" scope="row">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {formatTime(entry.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            entry.type === "clock-in" ? "Clock In" : "Clock Out"
                          }
                          color={
                            entry.type === "clock-in" ? "success" : "error"
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {showClockBackIn ? (
                          <Button
                            onClick={() => onStartDay(false)}
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrow />}
                            size="small"
                          >
                            Clock Back In
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onToggleEntry(entry.id)}
                            variant="outlined"
                            color={
                              entry.type === "clock-in" ? "error" : "success"
                            }
                            size="small"
                            disabled={!isMostRecent}
                          >
                            {entry.type === "clock-in" ? "Out" : "In"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Empty state */}
      {dayState.entries.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <AccessTime sx={{ fontSize: 80, color: "text.secondary", mb: 3 }} />
            <Typography
              variant="h5"
              component="h3"
              sx={{ fontWeight: "medium", mb: 2 }}
            >
              Ready to start your work day?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 400, mx: "auto" }}
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
      >
        <DialogTitle id="confirm-dialog-title">Start New Day?</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            This will clear all existing time entries and start a fresh day.
            This action cannot be undone. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStartNewDay} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStartNewDay}
            color="error"
            variant="contained"
            autoFocus
          >
            Start New Day
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
