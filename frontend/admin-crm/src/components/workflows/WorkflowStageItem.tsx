// frontend/admin-crm/src/components/workflows/WorkflowStageItem.tsx (partial)
import { Draggable } from "@hello-pangea/dnd";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  AccountCircle as PersonIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { WorkflowStage } from "../../types/workflows.types";

interface WorkflowStageItemProps {
  stage: WorkflowStage;
  index: number;
  onEdit: (stage: WorkflowStage) => void;
  onDelete: (stageId: number) => void;
  isReordering?: boolean; // Add this prop
}

const WorkflowStageItem: React.FC<WorkflowStageItemProps> = ({
  stage,
  index,
  onEdit,
  onDelete,
  isReordering = false, // Default to false
}) => {
  return (
    <Draggable draggableId={`stage-${stage.id}`} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            position: "relative",
            boxShadow: snapshot.isDragging
              ? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
              : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
            bgcolor: snapshot.isDragging
              ? "rgba(144, 202, 249, 0.08)"
              : "background.paper",
            // Add a subtle transition effect
            transform:
              isReordering && !snapshot.isDragging ? "scale(0.99)" : "scale(1)",
            opacity: isReordering && !snapshot.isDragging ? 0.7 : 1,
          }}
        >
          {isReordering && !snapshot.isDragging && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255, 255, 255, 0.6)",
                zIndex: 1,
                borderRadius: 1,
              }}
            >
              <CircularProgress size={20} />
            </Box>
          )}
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                {...provided.dragHandleProps}
                sx={{
                  display: "flex",
                  mr: 1,
                  color: "text.secondary",
                  cursor: "grab",
                }}
              >
                <DragIcon />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6">{stage.name}</Typography>
                  <Chip
                    size="small"
                    label={`Order: ${stage.order}`}
                    sx={{ ml: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Edit Stage">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(stage)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Stage">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(stage.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {stage.task_description}
                </Typography>

                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {stage.is_automated && (
                    <Chip
                      icon={
                        stage.automation_type === "EMAIL" ? (
                          <EmailIcon fontSize="small" />
                        ) : (
                          <ScheduleIcon fontSize="small" />
                        )
                      }
                      label={`${stage.automation_type}: ${stage.trigger_time}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {!stage.is_automated && (
                    <Chip
                      icon={<PersonIcon fontSize="small" />}
                      label="Manual Task"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default WorkflowStageItem;
