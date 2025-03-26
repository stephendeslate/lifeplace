// frontend/admin-crm/src/components/events/EventStatusChip.tsx
import {
  Cancel as CancelledIcon,
  CheckCircle as CompletedIcon,
  CheckCircleOutline as ConfirmedIcon,
  FiberNew as LeadIcon,
} from "@mui/icons-material";
import { Chip, ChipProps } from "@mui/material";
import React, { ReactElement } from "react";
import { EventStatus } from "../../types/events.types";

interface EventStatusChipProps extends Omit<ChipProps, "color" | "label"> {
  status: EventStatus;
  showIcon?: boolean;
}

export const EventStatusChip: React.FC<EventStatusChipProps> = ({
  status,
  showIcon = true,
  ...chipProps
}) => {
  const getStatusColor = (status: EventStatus): ChipProps["color"] => {
    switch (status) {
      case "LEAD":
        return "info";
      case "CONFIRMED":
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: EventStatus): ReactElement => {
    switch (status) {
      case "LEAD":
        return <LeadIcon />;
      case "CONFIRMED":
        return <ConfirmedIcon />;
      case "COMPLETED":
        return <CompletedIcon />;
      case "CANCELLED":
        return <CancelledIcon />;
      default:
        return <LeadIcon />; // Default icon
    }
  };

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case "LEAD":
        return "Lead";
      case "CONFIRMED":
        return "Confirmed";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      icon={showIcon ? getStatusIcon(status) : undefined}
      size="small"
      {...chipProps}
      sx={{
        fontWeight: "bold",
        // Add this to fix potential icon alignment issues
        "& .MuiChip-icon": {
          marginLeft: showIcon ? 1 : 0,
        },
        ...chipProps.sx,
      }}
    />
  );
};
