// frontend/admin-crm/src/components/events/EventForm.tsx
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import { useClients } from "../../hooks/useClients";
import { useEventTypes } from "../../hooks/useEventTypes";
import { useWorkflows } from "../../hooks/useWorkflows";
import {
  EventFormData,
  EventFormErrors,
  EventStatus,
} from "../../types/events.types";

interface EventFormProps {
  initialValues: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting: boolean;
  editMode?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  editMode = false,
}) => {
  const [formData, setFormData] =
    useState<Partial<EventFormData>>(initialValues);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [startDate, setStartDate] = useState<Date | null>(
    initialValues.start_date ? new Date(initialValues.start_date) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialValues.end_date ? new Date(initialValues.end_date) : null
  );

  // Fetch options for dropdowns
  const { eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();
  const { clients, isLoading: isLoadingClients } = useClients(1, {
    is_active: true,
  });
  const { templates: workflowTemplates, isLoading: isLoadingTemplates } =
    useWorkflows();

  // Update form data when initialValues change (for edit mode)
  useEffect(() => {
    setFormData(initialValues);
    setStartDate(
      initialValues.start_date ? new Date(initialValues.start_date) : null
    );
    setEndDate(
      initialValues.end_date ? new Date(initialValues.end_date) : null
    );
  }, [initialValues]);

  // Handle input changes
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent<any>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error when field is edited
      if (errors[name as keyof EventFormErrors]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      setFormData({
        ...formData,
        start_date: date.toISOString(),
      });

      // Clear error
      if (errors.start_date) {
        setErrors({
          ...errors,
          start_date: undefined,
        });
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date) {
      setFormData({
        ...formData,
        end_date: date.toISOString(),
      });

      // Clear error
      if (errors.end_date) {
        setErrors({
          ...errors,
          end_date: undefined,
        });
      }
    } else {
      // If end date is cleared, remove it from form data
      const updatedFormData = { ...formData };
      delete updatedFormData.end_date;
      setFormData(updatedFormData);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: EventFormErrors = {};

    if (!formData.client) {
      validationErrors.client = "Client is required";
    }

    if (!formData.event_type) {
      validationErrors.event_type = "Event type is required";
    }

    if (!formData.name || formData.name.trim() === "") {
      validationErrors.name = "Event name is required";
    }

    if (!formData.start_date) {
      validationErrors.start_date = "Start date is required";
    }

    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      validationErrors.end_date = "End date must be after start date";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure we have all required fields before submission
    if (
      formData.client &&
      formData.event_type &&
      formData.name &&
      formData.start_date
    ) {
      // Submit form with complete data
      onSubmit(formData as EventFormData);
    } else {
      // This should not happen if validation is working correctly
      console.error("Missing required fields", formData);
    }
  };

  // Status options for dropdown
  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: "LEAD", label: "Lead" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const isLoading =
    isLoadingEventTypes || isLoadingClients || isLoadingTemplates;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        {/* Client Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.client}>
            <InputLabel id="client-label">Client</InputLabel>
            <Select
              labelId="client-label"
              id="client"
              name="client"
              value={formData.client || ""}
              onChange={handleChange}
              label="Client"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} ({client.email})
                </MenuItem>
              ))}
            </Select>
            {errors.client && <FormHelperText>{errors.client}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Event Type Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.event_type}>
            <InputLabel id="event-type-label">Event Type</InputLabel>
            <Select
              labelId="event-type-label"
              id="event_type"
              name="event_type"
              value={formData.event_type || ""}
              onChange={handleChange}
              label="Event Type"
            >
              {eventTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {errors.event_type && (
              <FormHelperText>{errors.event_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Event Name */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            name="name"
            label="Event Name"
            value={formData.name || ""}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        {/* Event Status */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status || "LEAD"}
              onChange={handleChange}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Workflow Template Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="workflow-template-label">
              Workflow Template
            </InputLabel>
            <Select
              labelId="workflow-template-label"
              id="workflow_template"
              name="workflow_template"
              value={formData.workflow_template || ""}
              onChange={handleChange}
              label="Workflow Template"
            >
              <MenuItem value="">None</MenuItem>
              {workflowTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} md={6}>
          <DateTimePicker
            label="Start Date & Time *"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors.start_date,
                helperText: errors.start_date,
              },
            }}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} md={6}>
          <DateTimePicker
            label="End Date & Time (Optional)"
            value={endDate}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.end_date,
                helperText: errors.end_date,
              },
            }}
          />
        </Grid>

        {/* Lead Source */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="lead_source"
            name="lead_source"
            label="Lead Source"
            value={formData.lead_source || ""}
            onChange={handleChange}
            placeholder="How did the client hear about us?"
          />
        </Grid>

        {/* Total Price */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="total_price"
            name="total_price"
            label="Total Price"
            type="number"
            value={formData.total_price || ""}
            onChange={handleChange}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting
            ? "Saving..."
            : editMode
            ? "Update Event"
            : "Create Event"}
        </Button>
      </Box>
    </Box>
  );
};

export default EventForm;
