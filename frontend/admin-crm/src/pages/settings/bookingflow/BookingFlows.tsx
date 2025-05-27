// frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { bookingFlowApi } from "../../../apis/bookingflow.api";
import { BookingFlowDialog } from "../../../components/bookingflow/BookingFlowDialog";
import AddonConfigForm from "../../../components/bookingflow/steps/AddonConfigForm";
import ConfirmationConfigForm from "../../../components/bookingflow/steps/ConfirmationConfigForm";
import DateConfigForm from "../../../components/bookingflow/steps/DateConfigForm";
import IntroConfigForm from "../../../components/bookingflow/steps/IntroConfigForm";
import PackageConfigForm from "../../../components/bookingflow/steps/PackageConfigForm";
import PaymentConfigForm from "../../../components/bookingflow/steps/PaymentConfigForm";
import QuestionnaireConfigForm from "../../../components/bookingflow/steps/QuestionnaireConfigForm";
import SummaryConfigForm from "../../../components/bookingflow/steps/SummaryConfigForm";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  useBookingFlow,
  useBookingFlows,
} from "../../../hooks/useBookingFlows";
import { useProducts } from "../../../hooks/useProducts";
import { useQuestionnaires } from "../../../hooks/useQuestionnaires";
import {
  BookingFlow,
  BookingFlowFormData,
  BookingFlowFormErrors,
} from "../../../types/bookingflow.types";
import { EventType } from "../../../types/events.types";
import { WorkflowTemplate } from "../../../types/workflows.types";

type ConfigStep =
  | "intro"
  | "date"
  | "questionnaire"
  | "package"
  | "addon"
  | "summary"
  | "payment"
  | "confirmation";

const BookingFlows: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for dialogs and configuration
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<BookingFlow | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentConfigStep, setCurrentConfigStep] =
    useState<ConfigStep>("intro");

  // Form state
  const initialForm: BookingFlowFormData = {
    name: "",
    description: "",
    event_type: null,
    workflow_template: null,
    is_active: true,
  };
  const [flowForm, setFlowForm] = useState<BookingFlowFormData>(initialForm);
  const [flowFormErrors, setFlowFormErrors] = useState<BookingFlowFormErrors>(
    {}
  );

  // Use custom hooks for data fetching
  const {
    flows,
    totalCount,
    isLoading,
    eventTypes,
    isLoadingEventTypes,
    workflowTemplates,
    isLoadingWorkflowTemplates,
    createFlow,
    isCreatingFlow,
    updateFlow,
    isUpdatingFlow,
    deleteFlow,
    isDeletingFlow,
  } = useBookingFlows(
    page + 1,
    eventTypeFilter || undefined,
    showActiveOnly || undefined,
    searchTerm || undefined
  );

  // Get detailed booking flow for configuration
  const { flow: selectedFlowDetails, isLoading: isLoadingFlowDetails } =
    useBookingFlow(selectedFlow?.id);

  // Get additional data for configuration forms
  const { products = [] } = useProducts();
  const { questionnaires = [] } = useQuestionnaires();

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFlowForm({
      ...flowForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (flowFormErrors[name as keyof BookingFlowFormErrors]) {
      setFlowFormErrors({
        ...flowFormErrors,
        [name]: undefined,
      });
    }
  };

  // Handle event type change
  const handleEventTypeChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setFlowForm({
      ...flowForm,
      event_type: value,
    });
  };

  // Handle workflow template change
  const handleWorkflowTemplateChange = (
    e: SelectChangeEvent<string | number>
  ) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setFlowForm({
      ...flowForm,
      workflow_template: value,
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: BookingFlowFormErrors = {};
    let isValid = true;

    if (!flowForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!flowForm.event_type) {
      errors.event_type = "Event type is required";
      isValid = false;
    }

    setFlowFormErrors(errors);
    return isValid;
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      if (editMode && selectedFlow) {
        updateFlow({ id: selectedFlow.id, flowData: flowForm });
      } else {
        createFlow(flowForm);
      }
      setDialogOpen(false);
      resetForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setFlowForm(initialForm);
    setFlowFormErrors({});
    setEditMode(false);
    setSelectedFlow(null);
  };

  // Handle edit
  const handleEdit = (flow: BookingFlow) => {
    setFlowForm({
      name: flow.name,
      description: flow.description,
      event_type:
        typeof flow.event_type === "number"
          ? flow.event_type
          : flow.event_type.id,
      workflow_template: flow.workflow_template
        ? typeof flow.workflow_template === "number"
          ? flow.workflow_template
          : flow.workflow_template.id
        : null,
      is_active: flow.is_active,
    });
    setSelectedFlow(flow);
    setEditMode(true);
    setDialogOpen(true);
  };

  // Handle configure
  const handleConfigure = (flow: BookingFlow) => {
    setSelectedFlow(flow);
    setCurrentConfigStep("intro");
    setConfigDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedFlow) {
      deleteFlow(selectedFlow.id);
      setDeleteDialogOpen(false);
      setSelectedFlow(null);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get event type name
  const getEventTypeName = (eventType: number | EventType): string => {
    if (typeof eventType === "number") {
      const type = eventTypes.find((et) => et.id === eventType);
      return type?.name || "Unknown";
    }
    return eventType.name;
  };

  // Get workflow template name
  const getWorkflowTemplateName = (
    workflowTemplate: number | WorkflowTemplate | null | undefined
  ): string => {
    if (!workflowTemplate) return "None";
    if (typeof workflowTemplate === "number") {
      const template = workflowTemplates.find(
        (wt) => wt.id === workflowTemplate
      );
      return template?.name || "Unknown";
    }
    return workflowTemplate.name;
  };

  // Render configuration step content
  const renderConfigStepContent = () => {
    if (!selectedFlowDetails) return null;

    const handleConfigSave = async (configData: any) => {
      if (!selectedFlow) return;

      try {
        switch (currentConfigStep) {
          case "intro":
            await bookingFlowApi.updateIntroConfig(selectedFlow.id, configData);
            break;
          case "date":
            await bookingFlowApi.updateDateConfig(selectedFlow.id, configData);
            break;
          case "questionnaire":
            await bookingFlowApi.updateQuestionnaireConfig(
              selectedFlow.id,
              configData
            );
            break;
          case "package":
            await bookingFlowApi.updatePackageConfig(
              selectedFlow.id,
              configData
            );
            break;
          case "addon":
            await bookingFlowApi.updateAddonConfig(selectedFlow.id, configData);
            break;
          case "summary":
            await bookingFlowApi.updateSummaryConfig(
              selectedFlow.id,
              configData
            );
            break;
          case "payment":
            await bookingFlowApi.updatePaymentConfig(
              selectedFlow.id,
              configData
            );
            break;
          case "confirmation":
            await bookingFlowApi.updateConfirmationConfig(
              selectedFlow.id,
              configData
            );
            break;
        }
        // Optionally show success message
        console.log("Configuration saved successfully");
      } catch (error) {
        console.error("Error saving configuration:", error);
        // Handle error - could show toast notification
      }
    };

    const commonProps = {
      isLoading: false,
      onSave: handleConfigSave,
    };

    switch (currentConfigStep) {
      case "intro":
        return (
          <IntroConfigForm
            initialConfig={selectedFlowDetails.intro_config}
            {...commonProps}
          />
        );
      case "date":
        return (
          <DateConfigForm
            initialConfig={selectedFlowDetails.date_config}
            {...commonProps}
          />
        );
      case "questionnaire":
        return (
          <QuestionnaireConfigForm
            initialConfig={selectedFlowDetails.questionnaire_config}
            questionnaires={questionnaires}
            {...commonProps}
          />
        );
      case "package":
        return (
          <PackageConfigForm
            initialConfig={selectedFlowDetails.package_config}
            products={products}
            {...commonProps}
          />
        );
      case "addon":
        return (
          <AddonConfigForm
            initialConfig={selectedFlowDetails.addon_config}
            products={products}
            {...commonProps}
          />
        );
      case "summary":
        return (
          <SummaryConfigForm
            initialConfig={selectedFlowDetails.summary_config}
            {...commonProps}
          />
        );
      case "payment":
        return (
          <PaymentConfigForm
            initialConfig={selectedFlowDetails.payment_config}
            {...commonProps}
          />
        );
      case "confirmation":
        return (
          <ConfirmationConfigForm
            initialConfig={selectedFlowDetails.confirmation_config}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  const filteredFlows = flows.filter((flow) => {
    if (showActiveOnly && !flow.is_active) return false;
    return true;
  });

  return (
    <SettingsLayout
      title="Booking Flows"
      description="Manage booking flows for your events"
    >
      <Card>
        <CardContent>
          {/* Header with search and filters */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search booking flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Event Type</InputLabel>
                <Select
                  value={eventTypeFilter || ""}
                  onChange={(e) =>
                    setEventTypeFilter(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  label="Filter by Event Type"
                >
                  <MenuItem value="">All Event Types</MenuItem>
                  {eventTypes.map((eventType) => (
                    <MenuItem key={eventType.id} value={eventType.id}>
                      {eventType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                  />
                }
                label="Active only"
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
            >
              New Booking Flow
            </Button>
          </Box>

          {/* Loading state */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredFlows.length === 0 ? (
            <Alert severity="info">
              No booking flows found. Create your first booking flow to get
              started.
            </Alert>
          ) : (
            <>
              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Event Type</TableCell>
                      <TableCell>Workflow Template</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFlows.map((flow) => (
                      <TableRow key={flow.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {flow.name}
                            </Typography>
                            {flow.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {flow.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getEventTypeName(flow.event_type)}
                        </TableCell>
                        <TableCell>
                          {getWorkflowTemplateName(flow.workflow_template)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={flow.is_active ? "Active" : "Inactive"}
                            color={flow.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(flow.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleConfigure(flow)}
                            sx={{ mr: 1 }}
                            title="Configure Steps"
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(flow)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFlow(flow);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Flow Dialog */}
      <BookingFlowDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        flowForm={flowForm}
        flowFormErrors={flowFormErrors}
        onChange={handleFormChange}
        onEventTypeChange={handleEventTypeChange}
        onWorkflowTemplateChange={handleWorkflowTemplateChange}
        eventTypes={eventTypes}
        workflowTemplates={workflowTemplates}
        isLoading={isCreatingFlow || isUpdatingFlow}
        editMode={editMode}
      />

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Configure Booking Flow: {selectedFlow?.name}</DialogTitle>
        <DialogContent>
          {isLoadingFlowDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={currentConfigStep}
                onChange={(_, newValue) => setCurrentConfigStep(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Introduction" value="intro" />
                <Tab label="Date Selection" value="date" />
                <Tab label="Questionnaire" value="questionnaire" />
                <Tab label="Packages" value="package" />
                <Tab label="Add-ons" value="addon" />
                <Tab label="Summary" value="summary" />
                <Tab label="Payment" value="payment" />
                <Tab label="Confirmation" value="confirmation" />
              </Tabs>

              <Divider />

              <Box sx={{ mt: 3 }}>{renderConfigStepContent()}</Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Booking Flow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the booking flow "
            {selectedFlow?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeletingFlow}
            startIcon={isDeletingFlow && <CircularProgress size={16} />}
          >
            {isDeletingFlow ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default BookingFlows;
