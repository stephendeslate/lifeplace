// frontend/admin-crm/src/components/dashboard/DashboardHeader.tsx
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { TimeRange } from "../../types/dashboard.types";
import DashboardPreferencesDialog from "./DashboardPreferencesDialog";
import TimeRangeSelect from "./TimeRangeSelect";

interface DashboardHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRefresh: () => void;
  isLoading: boolean;
  userName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading,
  userName,
}) => {
  const theme = useTheme();
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Format current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { sm: "center" },
        justifyContent: "space-between",
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h3" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {userName ? `Welcome back, ${userName}!` : "Welcome back!"} |{" "}
          {currentDate}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          mt: { xs: 2, sm: 0 },
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TimeRangeSelect
          value={timeRange}
          onChange={onTimeRangeChange}
          sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
        />

        <Tooltip title="Refresh Dashboard">
          <IconButton
            onClick={onRefresh}
            disabled={isLoading}
            sx={{ mr: 1 }}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Dashboard Settings">
          <IconButton onClick={() => setPreferencesOpen(true)} color="primary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <DashboardPreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </Box>
  );
};

export default DashboardHeader;
