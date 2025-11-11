import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { setSimulatedTime, getSimulatedTime } from "../utils/timeSimulator";

export const TimeSimulatorPanel: React.FC = () => {
  const [simulatedDateTime, setSimulatedDateTime] = React.useState<string>("");
  const [, setRealTimeDisplay] = React.useState<Date>(new Date());
  const [expanded, setExpanded] = React.useState<boolean>(true);

  // Update reference clock display (completely decoupled from simulated time)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeDisplay(new Date()); // Show real current time as reference
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Initialize with current simulated time or current real time
    const simulated = getSimulatedTime();
    const timeToUse = simulated || new Date();
    setSimulatedTime(timeToUse);

    const year = timeToUse.getFullYear();
    const month = String(timeToUse.getMonth() + 1).padStart(2, "0");
    const day = String(timeToUse.getDate()).padStart(2, "0");
    const hours = String(timeToUse.getHours()).padStart(2, "0");
    const minutes = String(timeToUse.getMinutes()).padStart(2, "0");
    setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const handleTimeChange = (dateTimeString: string) => {
    setSimulatedDateTime(dateTimeString);
    if (dateTimeString) {
      const date = new Date(dateTimeString);
      if (!isNaN(date.getTime())) {
        setSimulatedTime(date);
      }
    }
  };

  const handleAdvanceTime = (minutes: number) => {
    const current = getSimulatedTime()!;
    const newTime = new Date(current.getTime() + minutes * 60 * 1000);
    setSimulatedTime(newTime);
    const year = newTime.getFullYear();
    const month = String(newTime.getMonth() + 1).padStart(2, "0");
    const day = String(newTime.getDate()).padStart(2, "0");
    const hours = String(newTime.getHours()).padStart(2, "0");
    const mins = String(newTime.getMinutes()).padStart(2, "0");
    setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${mins}`);
  };

  const handleQuickSet = (preset: string) => {
    const now = new Date();
    let date: Date;

    switch (preset) {
      case "monday-9am":
        // Set to next Monday at 9am
        const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
        date = new Date(now);
        date.setDate(now.getDate() + daysUntilMonday);
        date.setHours(9, 0, 0, 0);
        break;
      case "wednesday-9am":
        // Set to next Wednesday at 9am
        const daysUntilWednesday = (3 + 7 - now.getDay()) % 7 || 7;
        date = new Date(now);
        date.setDate(now.getDate() + daysUntilWednesday);
        date.setHours(9, 0, 0, 0);
        break;
      case "friday-9am":
        // Set to next Friday at 9am
        const daysUntilFriday = (5 + 7 - now.getDay()) % 7 || 7;
        date = new Date(now);
        date.setDate(now.getDate() + daysUntilFriday);
        date.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }

    setSimulatedTime(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <Card sx={{ border: "2px solid", borderColor: "warning.main" }}>
      <CardHeader
        sx={{
          py: 1,
          px: 2,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          "& .MuiCardHeader-action": {
            margin: 0,
            padding: 0,
          },
        }}
        title={
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              textAlign: "left",
              flex: 1,
            }}
          >
            Time Simulator
          </Typography>
        }
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            aria-label="expand or collapse"
            size="small"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
              Real Time: {realTimeDisplay.toLocaleString()}
            </Alert> */}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Quick Presets:
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 0.5,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickSet("monday-9am")}
                  sx={{ fontSize: "0.75rem", px: 0.5 }}
                >
                  Mon 9am
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickSet("wednesday-9am")}
                  sx={{ fontSize: "0.75rem", px: 0.5 }}
                >
                  Wed 9am
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickSet("friday-9am")}
                  sx={{ fontSize: "0.75rem", px: 0.5 }}
                >
                  Fri 9am
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Custom Time:
              </Typography>
              <TextField
                type="datetime-local"
                value={simulatedDateTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                size="small"
                fullWidth
                inputProps={{
                  min: "2000-01-01T00:00", // Allow any date from year 2000 onwards
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Adjust Time:
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 0.5,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(-15)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  -15m
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(-30)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  -30m
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(-60)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  -1h
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(-120)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  -2h
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(15)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  +15m
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(30)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  +30m
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(60)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  +1h
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAdvanceTime(120)}
                  sx={{ minWidth: "auto", fontSize: "0.75rem", px: 0.5 }}
                >
                  +2h
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};
