// frontend/admin-crm/src/components/questionnaires/QuestionnaireFieldsList.tsx
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Check as RequiredIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { QuestionnaireFieldFormData } from "../../types/questionnaires.types";

interface QuestionnaireFieldsListProps {
  fields: QuestionnaireFieldFormData[];
  onEditField: (field: QuestionnaireFieldFormData, index: number) => void;
  onDeleteField: (index: number) => void;
  onReorderFields: (reorderedFields: QuestionnaireFieldFormData[]) => void;
}

const QuestionnaireFieldsList: React.FC<QuestionnaireFieldsListProps> = ({
  fields,
  onEditField,
  onDeleteField,
  onReorderFields,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const reorderedFields = [...fields];
    const [removed] = reorderedFields.splice(startIndex, 1);
    reorderedFields.splice(endIndex, 0, removed);

    // Update order values
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      order: index + 1,
    }));

    onReorderFields(updatedFields);
  };

  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields-list">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable
                  key={`field-${index}`}
                  draggableId={`field-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      divider={index < fields.length - 1}
                      sx={{
                        borderLeft: 3,
                        borderColor: "primary.main",
                        backgroundColor: "background.paper",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemIcon {...provided.dragHandleProps}>
                        <DragIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1">
                              {field.name}
                            </Typography>
                            {field.required && (
                              <RequiredIcon fontSize="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                            <Chip
                              label={field.type}
                              size="small"
                              variant="outlined"
                            />
                            {field.options && field.options.length > 0 && (
                              <Chip
                                label={`${field.options.length} options`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => onEditField(field, index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => onDeleteField(index)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Paper>
  );
};

export default QuestionnaireFieldsList;
