// frontend/admin-crm/src/components/workflows/WorkflowTemplateDialog.tsx
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
import { EventType } from "../../types/events.types";
import {
  WorkflowTemplateFormData,
  WorkflowTemplateFormErrors,
} from "../../types/workflows.types";

interface WorkflowTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  templateForm: WorkflowTemplateFormData;
  templateFormErrors: WorkflowTemplateFormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onEventTypeChange: (e: SelectChangeEvent<string | number>) => void;
  eventTypes: EventType[];
  isLoading: boolean;
  editMode: boolean;
}

const WorkflowTemplateDialog: React.FC<WorkflowTemplateDialogProps> = ({
  open,
  onClose,
  onSave,
  templateForm,
  templateFormErrors,
  onChange,
  onEventTypeChange,
  eventTypes,
  isLoading,
  editMode,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Workflow Template" : "Create New Workflow Template"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Template Name"
              name="name"
              value={templateForm.name}
              onChange={onChange}
              error={!!templateFormErrors.name}
              helperText={templateFormErrors.name}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  name="is_active"
                  checked={templateForm.is_active}
                  onChange={onChange}
                  color="primary"
                />
              }
              label="Active"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={templateForm.description}
              onChange={onChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              {" "}
              {/* Add variant="outlined" here */}
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                value={templateForm.event_type || ""}
                onChange={onEventTypeChange}
                label="Event Type"
              >
                <MenuItem value="">None</MenuItem>
                {eventTypes.map((eventType) => (
                  <MenuItem key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Optional: associate with an event type
              </FormHelperText>
            </FormControl>
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

export default WorkflowTemplateDialog;
