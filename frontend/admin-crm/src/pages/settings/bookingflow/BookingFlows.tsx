// frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx
import {
  Add as AddIcon,
  BookOnline as BookingIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
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
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  BookingFlowDialog,
  BookingFlowItem,
} from "../../../components/bookingflow";
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
import { useEventTypes } from "../../../hooks/useEventTypes";
import { useProducts } from "../../../hooks/useProducts";
import { useQuestionnaires } from "../../../hooks/useQuestionnaires";
import {
  BookingFlow,
  BookingFlowDetail, // Make sure to import this type
  BookingFlowFormData,
  BookingFlowFormErrors,
} from "../../../types/bookingflow.types";

// Step tab type definition
type StepTabType =
  | "INTRO"
  | "DATE"
  | "QUESTIONNAIRE"
  | "PACKAGE"
  | "ADDON"
  | "SUMMARY"
  | "PAYMENT"
  | "CONFIRMATION";

// Step tab information
interface StepTabInfo {
  id: StepTabType;
  label: string;
  icon: React.ReactElement;
}

const BookingFlows: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [page, setPage] = useState(0);

  // State for selected flow and tab
  const [selectedFlow, setSelectedFlow] = useState<BookingFlow | null>(null);
  const [currentStep, setCurrentStep] = useState<StepTabType>("INTRO");

  // State for dialogs
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [deleteFlowDialogOpen, setDeleteFlowDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const initialFlowForm: BookingFlowFormData = {
    name: "",
    description: "",
    event_type: null,
    is_active: true,
  };
  const [flowForm, setFlowForm] =
    useState<BookingFlowFormData>(initialFlowForm);
  const [flowFormErrors, setFlowFormErrors] = useState<BookingFlowFormErrors>(
    {}
  );

  // Use custom hooks for data fetching
  const queryClient = useQueryClient();
  const {
    flows,
    totalCount,
    isLoading,
    createFlow,
    isCreatingFlow,
    updateFlow,
    isUpdatingFlow,
    deleteFlow,
    isDeletingFlow,
    updateQuestionnaireConfig,
    updatePackageConfig,
    updateAddonConfig,
    updateConfirmationConfig,
    updateIntroConfig,
    updateDateConfig,
    updateSummaryConfig,
    updatePaymentConfig,
  } = useBookingFlows(page + 1, eventTypeFilter || undefined, searchTerm);

  const {
    flow: flowDetails,
    isLoading: isLoadingFlow,
    refetch: refetchFlow,
  } = useBookingFlow(selectedFlow?.id) as {
    flow: BookingFlowDetail | null; // Explicitly type flowDetails as BookingFlowDetail
    isLoading: boolean;
    refetch: () => void;
  };

  const { eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();
  const { questionnaires, isLoading: isLoadingQuestionnaires } =
    useQuestionnaires();
  const { products: allProducts, isLoading: isLoadingProducts } = useProducts();

  // Step tabs definition
  const stepTabs: StepTabInfo[] = [
    {
      id: "INTRO",
      label: "Introduction",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "DATE",
      label: "Date Selection",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "QUESTIONNAIRE",
      label: "Questionnaire",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "PACKAGE",
      label: "Packages",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "ADDON",
      label: "Add-ons",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "SUMMARY",
      label: "Summary",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "PAYMENT",
      label: "Payment",
      icon: <BookingIcon fontSize="small" />,
    },
    {
      id: "CONFIRMATION",
      label: "Confirmation",
      icon: <BookingIcon fontSize="small" />,
    },
  ];

  // Handle flow form change
  const handleFlowFormChange = (
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
      event_type: value, // This should be a number, not an EventType object
    });
  };

  // Validate flow form
  const validateFlowForm = (): boolean => {
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

  // Handle save flow
  const handleSaveFlow = () => {
    if (validateFlowForm()) {
      if (editMode && selectedFlow) {
        updateFlow({ id: selectedFlow.id, flowData: flowForm });
      } else {
        createFlow(flowForm);
      }
      setFlowDialogOpen(false);
      resetFlowForm();
    }
  };

  // Reset flow form
  const resetFlowForm = () => {
    setFlowForm(initialFlowForm);
    setFlowFormErrors({});
    setEditMode(false);
  };

  // Handle edit flow
  const handleEditFlow = (flow: BookingFlow) => {
    setFlowForm({
      name: flow.name,
      description: flow.description,
      event_type:
        typeof flow.event_type === "number"
          ? flow.event_type
          : flow.event_type
          ? flow.event_type.id
          : null,
      is_active: flow.is_active,
    });
    setEditMode(true);
    setFlowDialogOpen(true);
  };

  // Handle flow selection
  const handleSelectFlow = (flow: BookingFlow) => {
    setSelectedFlow(flow);
    // Reset to INTRO tab when selecting a new flow
    setCurrentStep("INTRO");
  };

  // Handle tab change
  const handleStepChange = (
    event: React.SyntheticEvent,
    newValue: StepTabType
  ) => {
    setCurrentStep(newValue);
  };

  // Handle delete flow confirmation
  const handleDeleteFlow = () => {
    if (selectedFlow) {
      deleteFlow(selectedFlow.id);
      setDeleteFlowDialogOpen(false);
      setSelectedFlow(null);
    }
  };

  // Handle saving configuration updates
  // Updated handleConfigSave function for BookingFlows.tsx
  const handleConfigSave = (configData: any) => {
    if (selectedFlow && flowDetails) {
      switch (currentStep) {
        case "INTRO":
          updateIntroConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "DATE":
          updateDateConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "QUESTIONNAIRE":
          updateQuestionnaireConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "PACKAGE":
          updatePackageConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "ADDON":
          updateAddonConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "SUMMARY":
          updateSummaryConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "PAYMENT":
          updatePaymentConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        case "CONFIRMATION":
          updateConfirmationConfig({
            flowId: selectedFlow.id,
            configData,
          });
          break;
        default:
          console.error(`Unknown step: ${currentStep}`);
      }
    }
  };

  return (
    <SettingsLayout
      title="Booking Flows"
      description="Manage booking flows with fixed steps for your events"
    >
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Left sidebar - Flow list */}
        <Box
          sx={{
            width: 300,
            mr: 3,
            borderRight: "1px solid",
            borderColor: "divider",
            height: "100%",
            pr: 2,
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              placeholder="Search flows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, mr: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                resetFlowForm();
                setFlowDialogOpen(true);
              }}
            >
              New
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControl size="small" fullWidth variant="outlined">
              <InputLabel id="event-type-filter-label">
                Filter by Event Type
              </InputLabel>
              <Select
                labelId="event-type-filter-label"
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
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            }
            label="Show active only"
          />

          <Divider sx={{ my: 2 }} />

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : flows.length === 0 ? (
            <Alert severity="info">No booking flows found</Alert>
          ) : (
            <List sx={{ overflow: "auto", maxHeight: "calc(100vh - 300px)" }}>
              {flows
                .filter(
                  (flow: BookingFlow) => !showActiveOnly || flow.is_active
                )
                .map((flow: BookingFlow) => (
                  <ListItem key={flow.id} disablePadding sx={{ mb: 1 }}>
                    <BookingFlowItem
                      flow={flow}
                      selected={selectedFlow?.id === flow.id}
                      onSelect={handleSelectFlow}
                      onEdit={handleEditFlow}
                      onDelete={(flow: BookingFlow) => {
                        setSelectedFlow(flow);
                        setDeleteFlowDialogOpen(true);
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </Box>

        {/* Main content area - Step configuration */}
        <Box sx={{ flexGrow: 1 }}>
          {selectedFlow ? (
            <>
              {selectedFlow && flowDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">{flowDetails.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flowDetails.description}
                  </Typography>

                  <Box
                    sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {flowDetails.event_type_details && (
                      <Chip
                        label={`Event Type: ${flowDetails.event_type_details.name}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    <Chip
                      label={flowDetails.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={flowDetails.is_active ? "success" : "default"}
                    />
                  </Box>
                </Box>
              )}
              {selectedFlow && isLoadingFlow && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress />
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Step tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={currentStep}
                  onChange={handleStepChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="booking flow step tabs"
                >
                  {stepTabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      value={tab.id}
                      icon={tab.icon}
                      label={tab.label}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Step configuration forms */}
              <Box sx={{ mt: 3 }}>
                {flowDetails && !isLoadingFlow && (
                  <>
                    {currentStep === "INTRO" && (
                      <IntroConfigForm
                        initialConfig={flowDetails.intro_config}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "DATE" && (
                      <DateConfigForm
                        initialConfig={flowDetails.date_config}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "QUESTIONNAIRE" && (
                      <QuestionnaireConfigForm
                        initialConfig={flowDetails.questionnaire_config}
                        questionnaires={questionnaires}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "PACKAGE" && (
                      <PackageConfigForm
                        initialConfig={flowDetails.package_config}
                        products={allProducts.filter((p) => p.is_active)}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "ADDON" && (
                      <AddonConfigForm
                        initialConfig={flowDetails.addon_config}
                        products={allProducts.filter((p) => p.is_active)}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "SUMMARY" && (
                      <SummaryConfigForm
                        initialConfig={flowDetails.summary_config}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "PAYMENT" && (
                      <PaymentConfigForm
                        initialConfig={flowDetails.payment_config}
                        onSave={handleConfigSave}
                      />
                    )}
                    {currentStep === "CONFIRMATION" && (
                      <ConfirmationConfigForm
                        initialConfig={flowDetails.confirmation_config}
                        onSave={handleConfigSave}
                      />
                    )}
                  </>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                p: 4,
              }}
            >
              <BookingIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                No Booking Flow Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Select a booking flow from the sidebar or create a new one to
                manage its configuration.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                  resetFlowForm();
                  setFlowDialogOpen(true);
                }}
              >
                Create New Booking Flow
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Flow Dialog */}
      <BookingFlowDialog
        open={flowDialogOpen}
        onClose={() => setFlowDialogOpen(false)}
        onSave={handleSaveFlow}
        flowForm={flowForm}
        flowFormErrors={flowFormErrors}
        onChange={handleFlowFormChange}
        onEventTypeChange={handleEventTypeChange}
        eventTypes={eventTypes}
        isLoading={isCreatingFlow || isUpdatingFlow}
        editMode={editMode}
      />

      {/* Delete Flow Confirmation Dialog */}
      <Dialog
        open={deleteFlowDialogOpen}
        onClose={() => setDeleteFlowDialogOpen(false)}
      >
        <DialogTitle>Delete Booking Flow</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the booking flow "
            {selectedFlow?.name}"? This will also delete all associated
            configurations. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFlowDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteFlow}
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
