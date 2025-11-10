import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import {
  setSimulatedTime,
  disableSimulation,
  isSimulationActive,
  getSimulatedTime,
  getCurrentTime,
} from "../utils/timeSimulator";

export const TimeSimulatorPanel: React.FC = () => {
  const [simulatedDateTime, setSimulatedDateTime] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = React.useState<Date>(getCurrentTime());

  React.useEffect(() => {
    setIsActive(isSimulationActive());
    const simulated = getSimulatedTime();
    if (simulated) {
      const year = simulated.getFullYear();
      const month = String(simulated.getMonth() + 1).padStart(2, "0");
      const day = String(simulated.getDate()).padStart(2, "0");
      const hours = String(simulated.getHours()).padStart(2, "0");
      const minutes = String(simulated.getMinutes()).padStart(2, "0");
      setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, []);

  const handleSetTime = () => {
    if (simulatedDateTime) {
      const date = new Date(simulatedDateTime);
      setSimulatedTime(date);
      setIsActive(true);
    }
  };

  const handleDisable = () => {
    disableSimulation();
    setIsActive(false);
    setSimulatedDateTime("");
  };

  const handleAdvanceTime = (minutes: number) => {
    if (isActive) {
      const current = getSimulatedTime() || getCurrentTime();
      const newTime = new Date(current.getTime() + minutes * 60 * 1000);
      setSimulatedTime(newTime);
      const year = newTime.getFullYear();
      const month = String(newTime.getMonth() + 1).padStart(2, "0");
      const day = String(newTime.getDate()).padStart(2, "0");
      const hours = String(newTime.getHours()).padStart(2, "0");
      const mins = String(newTime.getMinutes()).padStart(2, "0");
      setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${mins}`);
    }
  };

  // Refresh current time display periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeDisplay(getCurrentTime());
      if (isActive) {
        const simulated = getSimulatedTime();
        if (simulated) {
          const year = simulated.getFullYear();
          const month = String(simulated.getMonth() + 1).padStart(2, "0");
          const day = String(simulated.getDate()).padStart(2, "0");
          const hours = String(simulated.getHours()).padStart(2, "0");
          const minutes = String(simulated.getMinutes()).padStart(2, "0");
          setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

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
    setIsActive(true);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    setSimulatedDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <Card sx={{ mb: 2, border: "2px solid", borderColor: "warning.main" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">Time Simulator (Dev Mode)</Typography>
            {isActive && (
              <Chip
                label="ACTIVE"
                color="warning"
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
            Current Time: {currentTimeDisplay.toLocaleString()}
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Quick Presets:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickSet("monday-9am")}
              >
                Monday 9am
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickSet("wednesday-9am")}
              >
                Wednesday 9am
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickSet("friday-9am")}
              >
                Friday 9am
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Custom Time:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                type="datetime-local"
                value={simulatedDateTime}
                onChange={(e) => setSimulatedDateTime(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button
                variant="contained"
                onClick={handleSetTime}
                disabled={!simulatedDateTime}
                size="small"
              >
                Set
              </Button>
            </Box>
          </Box>

          {isActive && (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Advance Time:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAdvanceTime(15)}
                  >
                    +15 min
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAdvanceTime(30)}
                  >
                    +30 min
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAdvanceTime(60)}
                  >
                    +1 hour
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAdvanceTime(120)}
                  >
                    +2 hours
                  </Button>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDisable}
                size="small"
              >
                Disable Simulation (Use Real Time)
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

