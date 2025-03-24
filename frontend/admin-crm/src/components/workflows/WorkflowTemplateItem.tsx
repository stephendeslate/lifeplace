// frontend/admin-crm/src/components/workflows/WorkflowTemplateItem.tsx
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
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
import { WorkflowTemplate } from "../../types/workflows.types";

interface WorkflowTemplateItemProps {
  template: WorkflowTemplate;
  selected: boolean;
  onSelect: (template: WorkflowTemplate) => void;
  onEdit: (template: WorkflowTemplate) => void;
  onDelete: (template: WorkflowTemplate) => void;
}

const WorkflowTemplateItem: React.FC<WorkflowTemplateItemProps> = ({
  template,
  selected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        cursor: "pointer",
        bgcolor: selected ? "action.selected" : "transparent",
        opacity: template.is_active ? 1 : 0.7,
      }}
      onClick={() => onSelect(template)}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {template.name}
        </Typography>

        {template.event_type && typeof template.event_type !== "number" && (
          <Chip
            label={template.event_type.name}
            size="small"
            sx={{ mt: 1, mr: 1 }}
          />
        )}

        {!template.is_active && (
          <Chip label="Inactive" size="small" color="default" sx={{ mt: 1 }} />
        )}

        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkflowTemplateItem;
