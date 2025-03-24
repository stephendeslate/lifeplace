// frontend/admin-crm/src/components/workflows/WorkflowStageDialog.tsx
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import React from "react";
import { EmailTemplate } from "../../types/settings.types";
import {
  WorkflowStageFormData,
  WorkflowStageFormErrors,
} from "../../types/workflows.types";

interface WorkflowStageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  stageForm: WorkflowStageFormData;
  stageFormErrors: WorkflowStageFormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onStageTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailTemplateChange: (e: SelectChangeEvent<string | number>) => void;
  emailTemplates: EmailTemplate[];
  isLoading: boolean;
  editMode: boolean;
}

const WorkflowStageDialog: React.FC<WorkflowStageDialogProps> = ({
  open,
  onClose,
  onSave,
  stageForm,
  stageFormErrors,
  onChange,
  onStageTypeChange,
  onEmailTemplateChange,
  emailTemplates,
  isLoading,
  editMode,
}) => {
  // Handler for automation type changes
  const handleAutomationTypeChange = (e: SelectChangeEvent) => {
    const newValue = e.target.value as string;
    // Create a synthetic event that mimics what onChange expects
    const syntheticEvent = {
      target: {
        name: "automation_type",
        value: newValue,
        type: "select",
        checked: false,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Workflow Stage" : "Add New Workflow Stage"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stage Name"
              name="name"
              value={stageForm.name}
              onChange={onChange}
              error={!!stageFormErrors.name}
              helperText={stageFormErrors.name}
              required
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="stage-type-label">Stage Type</InputLabel>
              <Select
                labelId="stage-type-label"
                value={stageForm.stage}
                onChange={(e) =>
                  onStageTypeChange(e as React.ChangeEvent<HTMLInputElement>)
                }
                label="Stage Type"
              >
                <MenuItem value="LEAD">Lead</MenuItem>
                <MenuItem value="PRODUCTION">Production</MenuItem>
                <MenuItem value="POST_PRODUCTION">Post Production</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              margin="normal"
              name="order"
              label="Order"
              type="number"
              value={stageForm.order}
              onChange={onChange}
              error={!!stageFormErrors.order}
              helperText={
                stageFormErrors.order ||
                "Determines the display order within this stage type. If you set an order that's already in use, other stages will be automatically reordered."
              }
              InputProps={{
                inputProps: { min: 1 },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="is_automated"
                  checked={stageForm.is_automated}
                  onChange={onChange}
                  color="primary"
                />
              }
              label="Automated Stage"
            />
          </Grid>

          {stageForm.is_automated && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={!!stageFormErrors.automation_type}
                  variant="outlined"
                >
                  <InputLabel id="automation-type-label">
                    Automation Type
                  </InputLabel>
                  <Select
                    labelId="automation-type-label"
                    name="automation_type"
                    value={stageForm.automation_type || ""}
                    onChange={handleAutomationTypeChange}
                    label="Automation Type"
                  >
                    <MenuItem value="EMAIL">Email</MenuItem>
                    <MenuItem value="TASK">Task</MenuItem>
                  </Select>
                  <FormHelperText>
                    {stageFormErrors.automation_type}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trigger Time"
                  name="trigger_time"
                  value={stageForm.trigger_time || ""}
                  onChange={onChange}
                  error={!!stageFormErrors.trigger_time}
                  helperText={
                    stageFormErrors.trigger_time ||
                    "e.g., ON_CREATION, AFTER_1_DAY"
                  }
                  required
                />
              </Grid>

              {stageForm.automation_type === "EMAIL" && (
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    error={!!stageFormErrors.email_template}
                    variant="outlined"
                  >
                    <InputLabel id="email-template-label">
                      Email Template
                    </InputLabel>
                    <Select
                      labelId="email-template-label"
                      value={stageForm.email_template || ""}
                      onChange={onEmailTemplateChange}
                      label="Email Template"
                    >
                      <MenuItem value="">None</MenuItem>
                      {emailTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {stageFormErrors.email_template}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Description"
              name="task_description"
              value={stageForm.task_description || ""}
              onChange={onChange}
              multiline
              rows={3}
              error={!!stageFormErrors.task_description}
              helperText={stageFormErrors.task_description}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={isLoading}>
          {isLoading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowStageDialog;
