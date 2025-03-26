// frontend/admin-crm/src/components/events/NextTaskChip.tsx
import {
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  Flag as UrgentIcon,
} from "@mui/icons-material";
import { Chip, Tooltip, Typography } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { NextTask, TaskPriority } from "../../types/events.types";

interface NextTaskChipProps {
  task: NextTask | null;
  maxDescriptionLength?: number;
}

export const NextTaskChip: React.FC<NextTaskChipProps> = ({
  task,
  maxDescriptionLength = 50,
}) => {
  if (!task) {
    return (
      <Chip
        label="No pending tasks"
        color="default"
        size="small"
        icon={<TaskIcon />}
      />
    );
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  const truncateDescription = (description: string) => {
    if (description.length <= maxDescriptionLength) {
      return description;
    }
    return `${description.slice(0, maxDescriptionLength)}...`;
  };

  // Format the due date
  const formattedDueDate = formatDistanceToNow(new Date(task.due_date), {
    addSuffix: true,
  });

  // Create tooltip content
  const tooltipContent = (
    <>
      <Typography variant="subtitle1" fontWeight="bold">
        {task.title}
      </Typography>
      <Typography variant="body2">{task.description}</Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Due: {formattedDueDate}
      </Typography>
      <Typography variant="caption" display="block">
        Priority: {task.priority}
      </Typography>
      <Typography variant="caption" display="block">
        Status: {task.status}
      </Typography>
    </>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        label={truncateDescription(task.title)}
        color={getPriorityColor(task.priority)}
        size="small"
        icon={task.priority === "URGENT" ? <UrgentIcon /> : <ScheduleIcon />}
        sx={{
          maxWidth: 200,
          "& .MuiChip-label": {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
    </Tooltip>
  );
};
