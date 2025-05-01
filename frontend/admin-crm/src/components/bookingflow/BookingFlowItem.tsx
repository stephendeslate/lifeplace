// frontend/admin-crm/src/components/bookingflow/BookingFlowItem.tsx
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";
import { BookingFlow } from "../../types/bookingflow.types";

interface BookingFlowItemProps {
  flow: BookingFlow;
  selected: boolean;
  onSelect: (flow: BookingFlow) => void;
  onEdit: (flow: BookingFlow) => void;
  onDelete: (flow: BookingFlow) => void;
}

export const BookingFlowItem: React.FC<BookingFlowItemProps> = ({
  flow,
  selected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const eventTypeName =
    typeof flow.event_type === "object"
      ? flow.event_type.name
      : flow.event_type || "Unknown";

  return (
    <Card
      variant={selected ? "elevation" : "outlined"}
      elevation={selected ? 4 : 0}
      sx={{
        width: "100%",
        mb: 1,
        transition: "all 0.2s",
        bgcolor: selected ? "primary.light" : "background.paper",
        position: "relative",
      }}
    >
      <CardActionArea onClick={() => onSelect(flow)} sx={{ py: 1, px: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={selected ? "bold" : "medium"}
            sx={{
              color: selected ? "primary.contrastText" : "text.primary",
              pr: 6, // Space for action buttons
            }}
          >
            {flow.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: selected ? "primary.contrastText" : "text.secondary" }}
            noWrap
          >
            {flow.description}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Chip
            label={eventTypeName}
            size="small"
            variant={selected ? "filled" : "outlined"}
            sx={{
              bgcolor: selected ? "primary.dark" : undefined,
              color: selected ? "primary.contrastText" : undefined,
            }}
          />
          <Chip
            label={flow.is_active ? "Active" : "Inactive"}
            size="small"
            color={flow.is_active ? "success" : "default"}
            sx={{
              bgcolor: selected && flow.is_active ? "success.dark" : undefined,
              color: selected ? "primary.contrastText" : undefined,
            }}
          />
          <Chip
            label="Fixed Steps"
            size="small"
            variant={selected ? "filled" : "outlined"}
            sx={{
              bgcolor: selected ? "primary.dark" : undefined,
              color: selected ? "primary.contrastText" : undefined,
            }}
          />
        </Box>
      </CardActionArea>

      {/* Action buttons */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(flow);
          }}
          sx={{
            color: selected ? "primary.contrastText" : "action.active",
            "&:hover": {
              bgcolor: selected ? "primary.dark" : undefined,
            },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(flow);
          }}
          sx={{
            color: selected ? "primary.contrastText" : "action.active",
            "&:hover": {
              bgcolor: selected ? "primary.dark" : undefined,
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
