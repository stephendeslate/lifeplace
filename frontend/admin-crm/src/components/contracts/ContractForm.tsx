// frontend/admin-crm/src/components/contracts/ContractForm.tsx
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
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
import { DatePicker } from "@mui/x-date-pickers";
import { addDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { contractsApi } from "../../apis/contracts.api";
import {
  ContractTemplate,
  EventContractFormData,
  EventContractFormErrors,
} from "../../types/contracts.types";
import { Event } from "../../types/events.types";

interface ContractFormProps {
  events: Event[];
  templates: ContractTemplate[];
  initialValues?: Partial<EventContractFormData>;
  onSubmit: (formData: EventContractFormData) => void;
  isLoading?: boolean;
  loadingEvents?: boolean;
  loadingTemplates?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  events,
  templates,
  initialValues,
  onSubmit,
  isLoading = false,
  loadingEvents = false,
  loadingTemplates = false,
}) => {
  // Initialize form state
  const [formData, setFormData] = useState<EventContractFormData>({
    event: initialValues?.event || 0,
    template: initialValues?.template || 0,
    valid_until:
      initialValues?.valid_until || addDays(new Date(), 30).toISOString(),
    context_data: initialValues?.context_data ?? {},
  });

  const [formErrors, setFormErrors] = useState<EventContractFormErrors>({});
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [contextFields, setContextFields] = useState<string[]>([]);

  // Find selected template when template ID changes
  useEffect(() => {
    if (formData.template) {
      const template = templates.find((t) => t.id === formData.template);
      setSelectedTemplate(template || null);

      if (template) {
        // Extract variables from template
        setContextFields(template.variables || []);

        // Initialize context data with empty values for any missing fields
        const initialContext = { ...formData.context_data };
        template.variables.forEach((variable) => {
          if (!(variable in initialContext)) {
            initialContext[variable] = "";
          }
        });

        setFormData((prev) => ({
          ...prev,
          context_data: initialContext,
        }));
      }
    }
  }, [formData.template, templates]);

  // Update preview when template or context data changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.content) {
      const previewHtml = contractsApi.previewContract(
        selectedTemplate.content,
        formData.context_data ?? {}
      );
      setPreviewContent(previewHtml);
    }
  }, [selectedTemplate, formData.context_data]);

  // Handle form field changes
  const handleChange = (field: keyof EventContractFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when field is modified
    if (formErrors[field as keyof EventContractFormErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined,
      });
    }
  };

  // Handle event selection
  const handleEventChange = (event: Event | null) => {
    if (event) {
      handleChange("event", event.id);
    }
  };

  // Handle template selection
  const handleTemplateChange = (e: SelectChangeEvent<number>) => {
    handleChange("template", Number(e.target.value));
  };

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      handleChange("valid_until", date.toISOString());
    } else {
      handleChange("valid_until", null);
    }
  };

  // Handle context field changes
  const handleContextChange = (variable: string, value: string) => {
    setFormData({
      ...formData,
      context_data: {
        ...(formData.context_data ?? {}),
        [variable]: value,
      },
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: EventContractFormErrors = {};
    let isValid = true;

    if (!formData.event) {
      errors.event = "Event is required";
      isValid = false;
    }

    if (!formData.template) {
      errors.template = "Contract template is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Find selected event
  const selectedEvent = events.find((e) => e.id === formData.event) || null;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Contract Information
          </Typography>
        </Grid>

        {/* Event Selection */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="event-select"
            value={selectedEvent}
            onChange={(e, newValue) => handleEventChange(newValue)}
            options={events}
            getOptionLabel={(option) => option.name}
            loading={loadingEvents}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Event"
                required
                error={!!formErrors.event}
                helperText={formErrors.event}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingEvents ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            disabled={isLoading}
          />
        </Grid>

        {/* Template Selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!formErrors.template}>
            <InputLabel id="template-select-label">
              Contract Template
            </InputLabel>
            <Select
              labelId="template-select-label"
              id="template-select"
              value={formData.template || ""}
              onChange={handleTemplateChange}
              label="Contract Template"
              required
              disabled={isLoading || loadingTemplates}
            >
              {loadingTemplates ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                  Loading templates...
                </MenuItem>
              ) : (
                <>
                  <MenuItem value="" disabled>
                    Select a template
                  </MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </>
              )}
            </Select>
            {formErrors.template && (
              <FormHelperText>{formErrors.template}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Valid Until Date */}
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Valid Until (Optional)"
            value={formData.valid_until ? new Date(formData.valid_until) : null}
            onChange={handleDateChange}
            disablePast
            slotProps={{
              textField: {
                fullWidth: true,
                disabled: isLoading,
              },
            }}
          />
          <FormHelperText>
            Date until which the contract is valid for signing
          </FormHelperText>
        </Grid>

        {/* Template Variables */}
        {selectedTemplate && contextFields.length > 0 && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contract Variables
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Fill in the values for the variables in this contract template
              </Typography>
            </Grid>

            {contextFields.map((variable) => (
              <Grid item xs={12} sm={6} key={variable}>
                <TextField
                  label={variable
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  value={formData.context_data?.[variable] || ""}
                  onChange={(e) =>
                    handleContextChange(variable, e.target.value)
                  }
                  fullWidth
                  disabled={isLoading}
                />
              </Grid>
            ))}
          </>
        )}

        {/* Preview Section */}
        {selectedTemplate && previewContent && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contract Preview
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "#fcfcfc",
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewContent.replace(/\n/g, "<br>"),
                  }}
                />
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                This is a preview of how the contract will appear. Review before
                submitting.
              </Alert>
            </Grid>
          </>
        )}

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? "Creating..." : "Create Contract"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ContractForm;
