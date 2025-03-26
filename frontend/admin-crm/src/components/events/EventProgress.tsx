// frontend/admin-crm/src/components/events/EventProgress.tsx
import { LinearProgress, Tooltip, Typography } from "@mui/material";
import React from "react";

interface EventProgressProps {
  progress: number; // Progress as a percentage (0-100)
  showPercentage?: boolean;
  height?: number;
  tooltip?: string;
}

export const EventProgress: React.FC<EventProgressProps> = ({
  progress,
  showPercentage = false,
  height = 10,
  tooltip,
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);

  // Determine color based on progress
  const getColor = () => {
    if (normalizedProgress < 25) return "error";
    if (normalizedProgress < 50) return "warning";
    if (normalizedProgress < 75) return "info";
    return "success";
  };

  const progressBar = (
    <div style={{ position: "relative", width: "100%" }}>
      <LinearProgress
        variant="determinate"
        value={normalizedProgress}
        color={getColor()}
        sx={{ height, borderRadius: height / 2 }}
      />

      {showPercentage && (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "text.secondary",
            fontWeight: "bold",
          }}
        >
          {Math.round(normalizedProgress)}%
        </Typography>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {progressBar}
      </Tooltip>
    );
  }

  return progressBar;
};
