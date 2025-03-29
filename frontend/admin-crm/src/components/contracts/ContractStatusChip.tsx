// frontend/admin-crm/src/components/contracts/ContractStatusChip.tsx
import {
  Description as DraftIcon,
  AccessTime as ExpiredIcon,
  Send as SentIcon,
  CheckCircle as SignedIcon,
  Cancel as VoidIcon,
} from "@mui/icons-material";
import { Chip, ChipProps } from "@mui/material";
import React from "react";
import { ContractStatus } from "../../types/contracts.types";

interface ContractStatusChipProps extends Omit<ChipProps, "label"> {
  status: ContractStatus;
}

const ContractStatusChip: React.FC<ContractStatusChipProps> = ({
  status,
  ...chipProps
}) => {
  // Define chip configuration based on status
  const chipConfig: Record<
    ContractStatus,
    { label: string; color: ChipProps["color"]; icon: React.ReactElement }
  > = {
    DRAFT: {
      label: "Draft",
      color: "default",
      icon: <DraftIcon fontSize="small" />,
    },
    SENT: {
      label: "Sent",
      color: "primary",
      icon: <SentIcon fontSize="small" />,
    },
    SIGNED: {
      label: "Signed",
      color: "success",
      icon: <SignedIcon fontSize="small" />,
    },
    EXPIRED: {
      label: "Expired",
      color: "warning",
      icon: <ExpiredIcon fontSize="small" />,
    },
    VOID: {
      label: "Void",
      color: "error",
      icon: <VoidIcon fontSize="small" />,
    },
  };

  const config = chipConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      icon={config.icon}
      size="small"
      {...chipProps}
    />
  );
};

export default ContractStatusChip;
