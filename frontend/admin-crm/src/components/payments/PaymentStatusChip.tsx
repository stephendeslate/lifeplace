// frontend/admin-crm/src/components/payments/PaymentStatusChip.tsx
import {
  CheckCircle as CompletedIcon,
  Error as FailedIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { Chip, ChipProps } from "@mui/material";
import React, { ReactElement } from "react";
import { PaymentStatus } from "../../types/payments.types";

interface PaymentStatusChipProps extends Omit<ChipProps, "color" | "label"> {
  status: PaymentStatus;
  showIcon?: boolean;
}

export const PaymentStatusChip: React.FC<PaymentStatusChipProps> = ({
  status,
  showIcon = true,
  ...chipProps
}) => {
  const getStatusColor = (status: PaymentStatus): ChipProps["color"] => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: PaymentStatus): ReactElement => {
    switch (status) {
      case "PENDING":
        return <PendingIcon />;
      case "COMPLETED":
        return <CompletedIcon />;
      case "FAILED":
        return <FailedIcon />;
      default:
        return <PendingIcon />; // Default icon
    }
  };

  const getStatusLabel = (status: PaymentStatus): string => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
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
        "& .MuiChip-icon": {
          marginLeft: showIcon ? 1 : 0,
        },
        ...chipProps.sx,
      }}
    />
  );
};
