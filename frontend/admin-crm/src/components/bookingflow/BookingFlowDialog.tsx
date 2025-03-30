// frontend/admin-crm/src/components/bookingflow/BookingFlowDialog.tsx
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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import React from "react";
import {
  BookingFlowFormData,
  BookingFlowFormErrors,
} from "../../types/bookingflow.types";
import { EventType } from "../../types/events.types";

interface BookingFlowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  flowForm: BookingFlowFormData;
  flowFormErrors: BookingFlowFormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onEventTypeChange: (e: SelectChangeEvent<string | number>) => void;
  eventTypes: EventType[];
  isLoading: boolean;
  editMode: boolean;
}

export const BookingFlowDialog: React.FC<BookingFlowDialogProps> = ({
  open,
  onClose,
  onSave,
  flowForm,
  flowFormErrors,
  onChange,
  onEventTypeChange,
  eventTypes,
  isLoading,
  editMode,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Booking Flow" : "Create New Booking Flow"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={flowForm.name}
          onChange={onChange}
          error={!!flowFormErrors.name}
          helperText={flowFormErrors.name}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          id="description"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={flowForm.description}
          onChange={onChange}
          error={!!flowFormErrors.description}
          helperText={flowFormErrors.description}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel id="event-type-label">Event Type</InputLabel>
          <Select
            labelId="event-type-label"
            id="event_type"
            name="event_type"
            value={flowForm.event_type || ""}
            onChange={onEventTypeChange}
            label="Event Type"
            error={!!flowFormErrors.event_type}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {eventTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
          {flowFormErrors.event_type && (
            <FormHelperText error>{flowFormErrors.event_type}</FormHelperText>
          )}
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={flowForm.is_active}
              onChange={onChange}
              name="is_active"
            />
          }
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
