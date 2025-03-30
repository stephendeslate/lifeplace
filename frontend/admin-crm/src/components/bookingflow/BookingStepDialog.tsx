// frontend/admin-crm/src/components/bookingflow/BookingStepDialog.tsx
import {
  Box,
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  BookingStepFormData,
  BookingStepFormErrors,
  StepType,
} from "../../types/bookingflow.types";
import { ProductOption } from "../../types/products.types";
import { Questionnaire } from "../../types/questionnaires.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`step-tabpanel-${index}`}
      aria-labelledby={`step-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `step-tab-${index}`,
    "aria-controls": `step-tabpanel-${index}`,
  };
}

interface BookingStepDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  stepForm: BookingStepFormData;
  stepFormErrors: BookingStepFormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onStepTypeChange: (e: SelectChangeEvent<StepType>) => void;
  onQuestionnaireChange?: (e: SelectChangeEvent<string | number>) => void;
  onProductSelectionTypeChange?: (
    e: SelectChangeEvent<string | number>
  ) => void;
  questionnaires?: Questionnaire[];
  products?: ProductOption[];
  isLoading: boolean;
  editMode: boolean;
}

export const BookingStepDialog: React.FC<BookingStepDialogProps> = ({
  open,
  onClose,
  onSave,
  stepForm,
  stepFormErrors,
  onChange,
  onStepTypeChange,
  onQuestionnaireChange,
  onProductSelectionTypeChange,
  questionnaires = [],
  products = [],
  isLoading,
  editMode,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const stepTypes: { value: StepType; label: string }[] = [
    { value: "INTRO", label: "Introduction" },
    { value: "EVENT_TYPE", label: "Event Type Selection" },
    { value: "DATE", label: "Date Selection" },
    { value: "QUESTIONNAIRE", label: "Questionnaire" },
    { value: "PRODUCT", label: "Product Selection" },
    { value: "ADDON", label: "Add-on Selection" },
    { value: "SUMMARY", label: "Booking Summary" },
    { value: "PAYMENT", label: "Payment" },
    { value: "CONFIRMATION", label: "Confirmation" },
    { value: "CUSTOM", label: "Custom Step" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Booking Step" : "Create New Booking Step"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="step configuration tabs"
          >
            <Tab label="Basic Information" {...a11yProps(0)} />
            <Tab
              label="Step Configuration"
              {...a11yProps(1)}
              disabled={!stepForm.step_type}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={stepForm.name}
            onChange={onChange}
            error={!!stepFormErrors.name}
            helperText={stepFormErrors.name}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="step-type-label">Step Type</InputLabel>
            <Select
              labelId="step-type-label"
              id="step_type"
              name="step_type"
              value={stepForm.step_type}
              onChange={onStepTypeChange}
              label="Step Type"
              error={!!stepFormErrors.step_type}
            >
              {stepTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            {stepFormErrors.step_type && (
              <FormHelperText error>{stepFormErrors.step_type}</FormHelperText>
            )}
          </FormControl>

          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={stepForm.description}
            onChange={onChange}
            error={!!stepFormErrors.description}
            helperText={stepFormErrors.description}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="instructions"
            name="instructions"
            label="Instructions for Client"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={stepForm.instructions}
            onChange={onChange}
            error={!!stepFormErrors.instructions}
            helperText={stepFormErrors.instructions}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="order"
            name="order"
            label="Display Order"
            type="number"
            fullWidth
            variant="outlined"
            value={stepForm.order || ""}
            onChange={onChange}
            error={!!stepFormErrors.order}
            helperText={stepFormErrors.order}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={stepForm.is_required}
                  onChange={onChange}
                  name="is_required"
                />
              }
              label="Required"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={stepForm.is_visible}
                  onChange={onChange}
                  name="is_visible"
                />
              }
              label="Visible"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {stepForm.step_type === "QUESTIONNAIRE" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Questionnaire Configuration
              </Typography>

              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="questionnaire-label">Questionnaire</InputLabel>
                <Select
                  labelId="questionnaire-label"
                  id="questionnaire_config.questionnaire"
                  name="questionnaire_config.questionnaire"
                  value={stepForm.questionnaire_config?.questionnaire || ""}
                  onChange={onQuestionnaireChange}
                  label="Questionnaire"
                  error={!!stepFormErrors.questionnaire_config?.questionnaire}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {questionnaires.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.name}
                    </MenuItem>
                  ))}
                </Select>
                {stepFormErrors.questionnaire_config?.questionnaire && (
                  <FormHelperText error>
                    {stepFormErrors.questionnaire_config.questionnaire}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      stepForm.questionnaire_config?.require_all_fields || false
                    }
                    onChange={onChange}
                    name="questionnaire_config.require_all_fields"
                  />
                }
                label="Require All Fields"
              />
            </Box>
          )}

          {(stepForm.step_type === "PRODUCT" ||
            stepForm.step_type === "ADDON") && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Selection Configuration
              </Typography>

              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="selection-type-label">
                  Selection Type
                </InputLabel>
                <Select
                  labelId="selection-type-label"
                  id="product_config.selection_type"
                  name="product_config.selection_type"
                  value={stepForm.product_config?.selection_type || "SINGLE"}
                  onChange={onProductSelectionTypeChange}
                  label="Selection Type"
                  error={!!stepFormErrors.product_config?.selection_type}
                >
                  <MenuItem value="SINGLE">Single Selection</MenuItem>
                  <MenuItem value="MULTIPLE">Multiple Selection</MenuItem>
                </Select>
                {stepFormErrors.product_config?.selection_type && (
                  <FormHelperText error>
                    {stepFormErrors.product_config.selection_type}
                  </FormHelperText>
                )}
              </FormControl>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  margin="dense"
                  id="product_config.min_selection"
                  name="product_config.min_selection"
                  label="Minimum Selection"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.product_config?.min_selection || 0}
                  onChange={onChange}
                  error={!!stepFormErrors.product_config?.min_selection}
                  helperText={stepFormErrors.product_config?.min_selection}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  id="product_config.max_selection"
                  name="product_config.max_selection"
                  label="Maximum Selection (0 = unlimited)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.product_config?.max_selection || 0}
                  onChange={onChange}
                  error={!!stepFormErrors.product_config?.max_selection}
                  helperText={stepFormErrors.product_config?.max_selection}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Note: Products can be added after saving the step.
              </Typography>
            </Box>
          )}

          {stepForm.step_type === "DATE" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Date Selection Configuration
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  margin="dense"
                  id="date_config.min_days_in_future"
                  name="date_config.min_days_in_future"
                  label="Minimum Days in Future"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.date_config?.min_days_in_future || 1}
                  onChange={onChange}
                  error={!!stepFormErrors.date_config?.min_days_in_future}
                  helperText={stepFormErrors.date_config?.min_days_in_future}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  id="date_config.max_days_in_future"
                  name="date_config.max_days_in_future"
                  label="Maximum Days in Future"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.date_config?.max_days_in_future || 365}
                  onChange={onChange}
                  error={!!stepFormErrors.date_config?.max_days_in_future}
                  helperText={stepFormErrors.date_config?.max_days_in_future}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  margin="dense"
                  id="date_config.buffer_before_event"
                  name="date_config.buffer_before_event"
                  label="Buffer Before Event (minutes)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.date_config?.buffer_before_event || 0}
                  onChange={onChange}
                  error={!!stepFormErrors.date_config?.buffer_before_event}
                  helperText={stepFormErrors.date_config?.buffer_before_event}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="dense"
                  id="date_config.buffer_after_event"
                  name="date_config.buffer_after_event"
                  label="Buffer After Event (minutes)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={stepForm.date_config?.buffer_after_event || 0}
                  onChange={onChange}
                  error={!!stepFormErrors.date_config?.buffer_after_event}
                  helperText={stepFormErrors.date_config?.buffer_after_event}
                  sx={{ mb: 2 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={stepForm.date_config?.allow_time_selection || true}
                    onChange={onChange}
                    name="date_config.allow_time_selection"
                  />
                }
                label="Allow Time Selection"
              />
            </Box>
          )}

          {stepForm.step_type === "CUSTOM" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Custom Step Configuration
              </Typography>

              <TextField
                margin="dense"
                id="custom_config.html_content"
                name="custom_config.html_content"
                label="HTML Content"
                type="text"
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                value={stepForm.custom_config?.html_content || ""}
                onChange={onChange}
                error={!!stepFormErrors.custom_config?.html_content}
                helperText={stepFormErrors.custom_config?.html_content}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      stepForm.custom_config?.use_react_component || false
                    }
                    onChange={onChange}
                    name="custom_config.use_react_component"
                  />
                }
                label="Use React Component"
              />

              {stepForm.custom_config?.use_react_component && (
                <>
                  <TextField
                    margin="dense"
                    id="custom_config.component_name"
                    name="custom_config.component_name"
                    label="Component Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={stepForm.custom_config?.component_name || ""}
                    onChange={onChange}
                    error={!!stepFormErrors.custom_config?.component_name}
                    helperText={stepFormErrors.custom_config?.component_name}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    margin="dense"
                    id="custom_config.component_props"
                    name="custom_config.component_props"
                    label="Component Props (JSON)"
                    type="text"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={
                      typeof stepForm.custom_config?.component_props ===
                      "object"
                        ? JSON.stringify(
                            stepForm.custom_config?.component_props,
                            null,
                            2
                          )
                        : stepForm.custom_config?.component_props || "{}"
                    }
                    onChange={onChange}
                    error={!!stepFormErrors.custom_config?.component_props}
                    helperText={stepFormErrors.custom_config?.component_props}
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Box>
          )}

          {stepForm.step_type &&
            stepForm.step_type !== "QUESTIONNAIRE" &&
            stepForm.step_type !== "PRODUCT" &&
            stepForm.step_type !== "ADDON" &&
            stepForm.step_type !== "DATE" &&
            stepForm.step_type !== "CUSTOM" && (
              <Typography>
                This step type doesn't require additional configuration.
              </Typography>
            )}
        </TabPanel>
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
