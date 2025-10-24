import React from "react";
import { AppBar, Tabs, Tab, Box } from "@mui/material";

interface TabItem {
  id: string;
  label: string;
}

interface CustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box sx={{ maxWidth: "lg", mx: "auto", width: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          centered
          variant="fullWidth"
          sx={{
            py: 1, // Add vertical padding to the tabs container
            "& .MuiTab-root": {
              minWidth: 120,
              fontWeight: "medium",
              borderRadius: 2,
              margin: "4px 8px",
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
            "& .MuiTabs-indicator": {
              display: "none", // Hide the default indicator since we're styling the tabs directly
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} value={tab.id} />
          ))}
        </Tabs>
      </Box>
    </AppBar>
  );
};
