// frontend/admin-crm/src/components/contracts/ContractTemplateForm.tsx
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  ContractSection,
  ContractTemplateFormData,
  ContractTemplateFormErrors,
} from "../../types/contracts.types";
import { EventType } from "../../types/events.types";

interface ContractTemplateFormProps {
  initialValues: ContractTemplateFormData;
  eventTypes: EventType[];
  onSubmit: (formData: ContractTemplateFormData) => void;
  isSubmitting: boolean;
  formErrors?: ContractTemplateFormErrors;
  editMode?: boolean;
}

const ContractTemplateForm: React.FC<ContractTemplateFormProps> = ({
  initialValues,
  eventTypes,
  onSubmit,
  isSubmitting,
  formErrors = {},
  editMode = false,
}) => {
  const [formData, setFormData] =
    useState<ContractTemplateFormData>(initialValues);
  const [variableInput, setVariableInput] = useState("");
  const [errors, setErrors] = useState<ContractTemplateFormErrors>(formErrors);

  // Handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is modified
    if (errors[name as keyof ContractTemplateFormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Handle event type selection
  const handleEventTypeChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setFormData({
      ...formData,
      event_type: value,
    });
  };

  // Handle adding a variable
  const handleAddVariable = () => {
    if (!variableInput.trim()) return;

    // Check for duplicates
    if (formData.variables.includes(variableInput.trim())) {
      setErrors({
        ...errors,
        variables: "Variable already exists",
      });
      return;
    }

    setFormData({
      ...formData,
      variables: [...formData.variables, variableInput.trim()],
    });
    setVariableInput("");

    // Clear error
    if (errors.variables) {
      setErrors({
        ...errors,
        variables: undefined,
      });
    }
  };

  // Handle removing a variable
  const handleRemoveVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    });
  };

  // Handle adding a section
  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          title: `Section ${formData.sections.length + 1}`,
          content: "",
        },
      ],
    });
  };

  // Handle updating a section
  const handleUpdateSection = (
    index: number,
    field: keyof ContractSection,
    value: string
  ) => {
    const newSections = [...formData.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      sections: newSections,
    });
  };

  // Handle removing a section
  const handleRemoveSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index),
    });
  };

  // Handle reordering sections via drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(formData.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({
      ...formData,
      sections: items,
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: ContractTemplateFormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = "Template content is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="event-type-label">Event Type (Optional)</InputLabel>
            <Select
              labelId="event-type-label"
              label="Event Type (Optional)"
              value={formData.event_type || ""}
              onChange={handleEventTypeChange}
              disabled={isSubmitting}
            >
              <MenuItem value="">
                <em>All Event Types</em>
              </MenuItem>
              {eventTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Specifying an event type will restrict this template to that type
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="requires_signature"
                checked={formData.requires_signature}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            }
            label="Requires Signature"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Template Variables
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Write the full contract template content. Use variables with {"{{"}
            variable_name{"}}"} syntax.
          </Typography>

          <Box sx={{ display: "flex", mb: 2 }}>
            <TextField
              label="Variable Name"
              size="small"
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              error={!!errors.variables}
              helperText={errors.variables}
              sx={{ flexGrow: 1, mr: 1 }}
              disabled={isSubmitting}
            />
            <Button
              variant="contained"
              onClick={handleAddVariable}
              startIcon={<AddIcon />}
              disabled={isSubmitting || !variableInput.trim()}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {formData.variables.map((variable) => (
              <Chip
                key={variable}
                label={variable}
                onDelete={() => handleRemoveVariable(variable)}
                disabled={isSubmitting}
              />
            ))}
            {formData.variables.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No variables defined yet
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Contract Sections</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddSection}
              disabled={isSubmitting}
            >
              Add Section
            </Button>
          </Box>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {formData.sections.map((section, index) => (
                    <Draggable
                      key={`section-${index}`}
                      draggableId={`section-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ mb: 2, p: 2 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              style={{ marginRight: 8, cursor: "grab" }}
                            >
                              <DragIcon color="action" />
                            </div>
                            <TextField
                              label="Section Title"
                              value={section.title}
                              onChange={(e) =>
                                handleUpdateSection(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              fullWidth
                              size="small"
                              disabled={isSubmitting}
                            />
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveSection(index)}
                              disabled={isSubmitting}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <TextField
                            label="Section Content"
                            value={section.content}
                            onChange={(e) =>
                              handleUpdateSection(
                                index,
                                "content",
                                e.target.value
                              )
                            }
                            fullWidth
                            multiline
                            rows={4}
                            disabled={isSubmitting}
                          />
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {formData.sections.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 3 }}
                    >
                      No sections added yet. Click "Add Section" to add content
                      sections.
                    </Typography>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Template Content
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Write the full contract template content. Use variables with {"{{"}
            variable_name{"}}"} syntax.
          </Typography>
          <TextField
            name="content"
            value={formData.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={12}
            placeholder="Enter contract content here..."
            error={!!errors.content}
            helperText={
              errors.content ||
              "Use variables with double curly braces (e.g. {{client_name}})"
            }
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting
                ? "Saving..."
                : editMode
                ? "Update Template"
                : "Create Template"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ContractTemplateForm;
