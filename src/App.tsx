import { useState } from "react";
import {
  Container,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { WorkHoursTracker } from "./components/WorkHoursTracker";
import { DiscountCalculator } from "../src/components/DiscountCalculator";
import { CustomTabs } from "../src/components/Tabs";
import { TimeEntry, DayState } from "./types";

// Create a dark theme for the app
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f59e0b", // amber-500
    },
    secondary: {
      main: "#64748b", // slate-500
    },
    background: {
      default: "#0f172a", // slate-900
      paper: "#1e293b", // slate-800
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12, // Default border radius for all components
  },
  components: {
    // Card component styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    // Button component styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none", // Remove uppercase transformation
        },
      },
    },
    // TextField component styling
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    // Chip component styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    // Table component styling
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Alert component styling
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // AppBar component styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Keep AppBar square
        },
      },
    },
    // Tab component styling
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "0 4px",
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState<
    "work-hours-tracker" | "discount-calculator"
  >("work-hours-tracker");
  const [dayState, setDayState] = useState<DayState>({
    isActive: false,
    entries: [],
  });

  const handleStartDay = (clearExisting = false) => {
    const now = new Date();
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: "clock-in",
    };

    setDayState((prev) => ({
      isActive: true,
      entries: clearExisting ? [newEntry] : [...prev.entries, newEntry],
      startTime: clearExisting ? now : prev.startTime || now,
      dayDate: clearExisting ? now : prev.dayDate || now,
    }));
  };

  const handleEndDay = () => {
    const now = new Date();
    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: "clock-out",
    };

    setDayState((prev) => ({
      ...prev,
      isActive: false,
      entries: [...prev.entries, newEntry],
      endTime: now,
    }));
  };

  const handleToggleEntry = (entryId: string, reason?: string) => {
    setDayState((prev) => {
      const entryIndex = prev.entries.findIndex((e) => e.id === entryId);
      if (entryIndex === -1) return prev;

      const entry = prev.entries[entryIndex];
      const newType = entry.type === "clock-in" ? "clock-out" : "clock-in";
      const now = new Date();

      // Create a new entry instead of modifying the existing one
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        timestamp: now,
        type: newType,
        reason: newType === "clock-out" ? reason : undefined,
      };

      return {
        ...prev,
        entries: [...prev.entries, newEntry],
        // Don't change isActive - that's only controlled by End Day button
      };
    });
  };

  const tabs = [
    { id: "work-hours-tracker", label: "Work Hours Tracker" },
    { id: "discount-calculator", label: "Discount Calculator" },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        {/* Navigation */}
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) =>
            setActiveTab(tabId as "work-hours-tracker" | "discount-calculator")
          }
        />

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          {activeTab === "work-hours-tracker" && (
            <WorkHoursTracker
              dayState={dayState}
              onStartDay={handleStartDay}
              onEndDay={handleEndDay}
              onToggleEntry={handleToggleEntry}
            />
          )}
          {activeTab === "discount-calculator" && <DiscountCalculator />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
