// frontend/admin-crm/src/components/bookingflow/BookingStepItem.tsx
import { DraggableProvided } from "@hello-pangea/dnd";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  VisibilityOff as HiddenIcon,
  CheckCircle as RequiredIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { BookingStep } from "../../types/bookingflow.types";

interface BookingStepItemProps {
  step: BookingStep;
  index: number;
  onEdit: (step: BookingStep) => void;
  onDelete: (stepId: number) => void;
  isReordering: boolean;
  provided?: DraggableProvided;
}

export const BookingStepItem: React.FC<BookingStepItemProps> = ({
  step,
  index,
  onEdit,
  onDelete,
  isReordering,
  provided,
}) => {
  // Determine step specific info
  const getStepSpecificInfo = (): React.ReactNode => {
    switch (step.step_type) {
      case "QUESTIONNAIRE":
        if (step.questionnaire_config) {
          const questionnaire = step.questionnaire_config.questionnaire_details;
          return (
            <Chip
              size="small"
              variant="outlined"
              label={
                typeof questionnaire === "object"
                  ? questionnaire.name
                  : "Questionnaire"
              }
              sx={{ mr: 1 }}
            />
          );
        }
        break;
      case "PRODUCT":
      case "ADDON":
        if (step.product_config) {
          const itemCount = step.product_config.product_items?.length || 0;
          return (
            <Chip
              size="small"
              variant="outlined"
              label={`${itemCount} ${itemCount === 1 ? "Product" : "Products"}`}
              sx={{ mr: 1 }}
            />
          );
        }
        break;
      case "DATE":
        if (step.date_config) {
          const min = step.date_config.min_days_in_future;
          const max = step.date_config.max_days_in_future;
          return (
            <Chip
              size="small"
              variant="outlined"
              label={`${min}-${max} days ahead`}
              sx={{ mr: 1 }}
            />
          );
        }
        break;
      default:
        return null;
    }
  };

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      sx={{
        mb: 2,
        position: "relative",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        boxShadow: 1,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <Box
        {...provided?.dragHandleProps}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          color: "text.secondary",
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <DragIcon />
      </Box>

      <CardContent sx={{ pl: 5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" component="div">
              {step.name}
              <Chip
                size="small"
                label={`Step ${step.order}`}
                sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
              />
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {step.description}
            </Typography>
          </Box>

          <Box>
            <IconButton
              size="small"
              onClick={() => onEdit(step)}
              disabled={isReordering}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(step.id)}
              disabled={isReordering}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label={step.step_type_display || step.step_type}
            color="primary"
            sx={{ mr: 1 }}
          />

          {getStepSpecificInfo()}

          {!step.is_visible && (
            <Tooltip title="Hidden step">
              <Chip
                size="small"
                icon={<HiddenIcon fontSize="small" />}
                label="Hidden"
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}

          {step.is_required && (
            <Tooltip title="Required step">
              <Chip
                size="small"
                icon={<RequiredIcon fontSize="small" />}
                label="Required"
                color="secondary"
              />
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
