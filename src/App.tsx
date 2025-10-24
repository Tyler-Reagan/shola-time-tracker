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
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      "@media (min-width:600px)": {
        fontSize: "2.5rem",
      },
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "2rem",
      },
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.75rem",
      },
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "1.125rem",
      },
    },
    body1: {
      fontSize: "0.875rem",
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },
    body2: {
      fontSize: "0.75rem",
      "@media (min-width:600px)": {
        fontSize: "0.875rem",
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shape: {
    borderRadius: 8, // Reduced border radius for mobile
  },
  components: {
    // Card component styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "8px 0",
          "@media (min-width:600px)": {
            borderRadius: 12,
            margin: "16px 0",
          },
        },
      },
    },
    // Button component styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          minHeight: 44, // Touch-friendly minimum height
          padding: "8px 16px",
          "@media (min-width:600px)": {
            borderRadius: 8,
            minHeight: 36,
            padding: "6px 16px",
          },
        },
      },
    },
    // TextField component styling
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            minHeight: 44,
            "@media (min-width:600px)": {
              borderRadius: 8,
              minHeight: 40,
            },
          },
        },
      },
    },
    // Chip component styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 32,
          "@media (min-width:600px)": {
            borderRadius: 8,
            height: 28,
          },
        },
      },
    },
    // Table component styling
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "@media (min-width:600px)": {
            borderRadius: 12,
          },
        },
      },
    },
    // Table cell styling for mobile
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
          fontSize: "0.75rem",
          "@media (min-width:600px)": {
            padding: "12px 16px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    // Alert component styling
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "@media (min-width:600px)": {
            borderRadius: 12,
          },
        },
      },
    },
    // AppBar component styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    // Tab component styling
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: "2px 4px",
          minHeight: 48,
          fontSize: "0.875rem",
          "@media (min-width:600px)": {
            borderRadius: 8,
            margin: "4px 8px",
            minHeight: 40,
            fontSize: "1rem",
          },
        },
      },
    },
    // Dialog component styling
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: "16px",
          maxHeight: "calc(100% - 32px)",
          "@media (min-width:600px)": {
            margin: "32px",
            maxHeight: "calc(100% - 64px)",
          },
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
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            maxWidth: { xs: "100%", sm: "100%", md: "lg" },
          }}
        >
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
