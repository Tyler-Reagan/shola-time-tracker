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
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "lg" },
          mx: "auto",
          width: "100%",
          px: { xs: 1, sm: 0 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          centered
          variant="fullWidth"
          sx={{
            py: { xs: 0.5, sm: 1 },
            "& .MuiTab-root": {
              minWidth: { xs: 80, sm: 120 },
              fontWeight: "medium",
              borderRadius: { xs: 1, sm: 2 },
              margin: { xs: "2px 4px", sm: "4px 8px" },
              transition: "all 0.2s ease-in-out",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              minHeight: { xs: 48, sm: 40 },
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
              display: "none",
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
              value={tab.id}
              sx={{
                textTransform: "none",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
          ))}
        </Tabs>
      </Box>
    </AppBar>
  );
};
