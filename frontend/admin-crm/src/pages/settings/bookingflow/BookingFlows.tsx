// frontend/admin-crm/src/pages/settings/bookingflow/BookingFlows.tsx
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
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
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  BookingFlowDialog,
  BookingFlowItem,
  BookingStepDialog,
  BookingStepItem,
  BookingStepTabs,
  ProductStepItems,
} from "../../../components/bookingflow";
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
  BookingFlowFormData,
  BookingFlowFormErrors,
  BookingStep,
  BookingStepFormData,
  BookingStepFormErrors,
  ProductStepItemFormData,
  StepType,
} from "../../../types/bookingflow.types";

const BookingFlows: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [page, setPage] = useState(0);

  // State for selected flow and tab
  const [selectedFlow, setSelectedFlow] = useState<BookingFlow | null>(null);
  const [currentTab, setCurrentTab] = useState<StepType>("INTRO");

  // State for dialogs
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [deleteFlowDialogOpen, setDeleteFlowDialogOpen] = useState(false);
  const [deleteStepDialogOpen, setDeleteStepDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
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

  const initialStepForm: BookingStepFormData = {
    name: "",
    step_type: "INTRO",
    description: "",
    instructions: "",
    is_required: true,
    is_visible: true,
  };
  const [stepForm, setStepForm] =
    useState<BookingStepFormData>(initialStepForm);
  const [stepFormErrors, setStepFormErrors] = useState<BookingStepFormErrors>(
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
    createStep,
    isCreatingStep,
    updateStep,
    isUpdatingStep,
    deleteStep,
    isDeletingStep,
    reorderSteps,
    isReorderingSteps,
    createProductItem,
    isCreatingProductItem,
    updateProductItem,
    isUpdatingProductItem,
    deleteProductItem,
    isDeletingProductItem,
    reorderProductItems,
    isReorderingProductItems,
  } = useBookingFlows(page + 1, eventTypeFilter || undefined, searchTerm);

  const {
    flow: flowDetails,
    steps: flowSteps,
    isLoading: isLoadingFlow,
    refetchSteps,
  } = useBookingFlow(selectedFlow?.id);

  const { eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();
  const { questionnaires, isLoading: isLoadingQuestionnaires } =
    useQuestionnaires();
  const { products: allProducts, isLoading: isLoadingProducts } = useProducts();

  // Get steps for current flow and tab
  const getFilteredSteps = (): BookingStep[] => {
    if (!flowSteps) return [];
    return flowSteps
      .filter((step) => step.step_type === currentTab)
      .sort((a, b) => a.order - b.order);
  };

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
      event_type: value,
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

  // Handle step form change
  const handleStepFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Handle nested properties like questionnaire_config.questionnaire
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setStepForm({
        ...stepForm,
        [parent]: {
          ...((stepForm[parent as keyof BookingStepFormData] as object) || {}),
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setStepForm({
        ...stepForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error when typing
    if (
      stepFormErrors[name as keyof BookingStepFormErrors] ||
      (name.includes(".") &&
        stepFormErrors[name.split(".")[0] as keyof BookingStepFormErrors])
    ) {
      // Handle nested errors
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setStepFormErrors({
          ...stepFormErrors,
          [parent]: {
            ...((stepForm[parent as keyof BookingStepFormData] as object) ||
              {}),
            [child]: type === "checkbox" ? checked : value,
          },
        });
      } else {
        setStepFormErrors({
          ...stepFormErrors,
          [name]: undefined,
        });
      }
    }
  };

  // Handle step type change
  const handleStepTypeChange = (e: SelectChangeEvent<string>) => {
    const newStepType = e.target.value as StepType;

    // Initialize config based on step type
    let configUpdate = {};

    switch (newStepType) {
      case "QUESTIONNAIRE":
        configUpdate = {
          questionnaire_config: {
            questionnaire: 0,
            require_all_fields: false,
          },
        };
        break;
      case "PRODUCT":
      case "ADDON":
        configUpdate = {
          product_config: {
            min_selection: 1,
            max_selection: 0,
            selection_type: "SINGLE",
            product_items: [],
          },
        };
        break;
      case "DATE":
        configUpdate = {
          date_config: {
            min_days_in_future: 1,
            max_days_in_future: 365,
            allow_time_selection: true,
            buffer_before_event: 0,
            buffer_after_event: 0,
          },
        };
        break;
      case "CUSTOM":
        configUpdate = {
          custom_config: {
            html_content: "",
            use_react_component: false,
            component_name: "",
            component_props: {},
          },
        };
        break;
    }

    setStepForm({
      ...stepForm,
      step_type: newStepType,
      ...configUpdate,
    });
  };

  // Handle questionnaire change
  const handleQuestionnaireChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value);
    setStepForm({
      ...stepForm,
      questionnaire_config: {
        ...stepForm.questionnaire_config!,
        questionnaire: value,
      },
    });
  };

  // Handle product selection type change
  const handleProductSelectionTypeChange = (
    e: SelectChangeEvent<string | number>
  ) => {
    const value = e.target.value as "SINGLE" | "MULTIPLE";
    setStepForm({
      ...stepForm,
      product_config: {
        ...stepForm.product_config!,
        selection_type: value,
      },
    });
  };

  // Validate step form
  const validateStepForm = (): boolean => {
    const errors: BookingStepFormErrors = {};
    let isValid = true;

    if (!stepForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!stepForm.step_type) {
      errors.step_type = "Step type is required";
      isValid = false;
    }

    // Validate questionnaire config if step type is QUESTIONNAIRE
    if (
      stepForm.step_type === "QUESTIONNAIRE" &&
      stepForm.questionnaire_config
    ) {
      if (!stepForm.questionnaire_config.questionnaire) {
        errors.questionnaire_config = {
          questionnaire: "Questionnaire is required",
        };
        isValid = false;
      }
    }

    setStepFormErrors(errors);
    return isValid;
  };

  // Handle save step
  const handleSaveStep = () => {
    if (!selectedFlow) return;

    if (validateStepForm()) {
      if (editMode && selectedStepId) {
        updateStep({
          id: selectedStepId,
          stepData: stepForm,
          flowId: selectedFlow.id,
        });
      } else {
        createStep({
          flowId: selectedFlow.id,
          stepData: stepForm,
        });
      }
      setStepDialogOpen(false);
      resetStepForm();
    }
  };

  // Handle drag end for reordering steps
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedFlow) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const filteredSteps = getFilteredSteps();

    // Create a copy of the filtered steps for reordering
    const newSteps = Array.from(filteredSteps);
    const [movedStep] = newSteps.splice(startIndex, 1);
    newSteps.splice(endIndex, 0, movedStep);

    // Create the order mapping based on the new positions
    const orderMapping: { [key: string]: number } = {};
    newSteps.forEach((step, index) => {
      orderMapping[step.id.toString()] = index + 1;
    });

    // Call the reorderSteps mutation with the new order mapping
    reorderSteps({
      flow_id: selectedFlow.id,
      order_mapping: orderMapping,
    });
  };

  // Reset flow form
  const resetFlowForm = () => {
    setFlowForm(initialFlowForm);
    setFlowFormErrors({});
    setEditMode(false);
  };

  // Reset step form
  const resetStepForm = () => {
    // Set default order to next available order
    const nextOrder = getFilteredSteps().length + 1;
    setStepForm({
      ...initialStepForm,
      step_type: currentTab,
      order: nextOrder,
    });
    setStepFormErrors({});
    setEditMode(false);
    setSelectedStepId(null);
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

  // Handle edit step
  const handleEditStep = (step: BookingStep) => {
    // Create a form data object based on the step type and configuration
    const formData: BookingStepFormData = {
      name: step.name,
      step_type: step.step_type,
      description: step.description,
      instructions: step.instructions,
      order: step.order,
      is_required: step.is_required,
      is_visible: step.is_visible,
    };

    // Add configuration based on step type
    if (step.step_type === "QUESTIONNAIRE" && step.questionnaire_config) {
      formData.questionnaire_config = {
        questionnaire:
          typeof step.questionnaire_config.questionnaire === "number"
            ? step.questionnaire_config.questionnaire
            : step.questionnaire_config.questionnaire.id,
        require_all_fields: step.questionnaire_config.require_all_fields,
      };
    } else if (
      (step.step_type === "PRODUCT" || step.step_type === "ADDON") &&
      step.product_config
    ) {
      formData.product_config = {
        min_selection: step.product_config.min_selection,
        max_selection: step.product_config.max_selection,
        selection_type: step.product_config.selection_type,
      };
    } else if (step.step_type === "DATE" && step.date_config) {
      formData.date_config = {
        min_days_in_future: step.date_config.min_days_in_future,
        max_days_in_future: step.date_config.max_days_in_future,
        allow_time_selection: step.date_config.allow_time_selection,
        buffer_before_event: step.date_config.buffer_before_event,
        buffer_after_event: step.date_config.buffer_after_event,
      };
    } else if (step.step_type === "CUSTOM" && step.custom_config) {
      formData.custom_config = {
        html_content: step.custom_config.html_content,
        use_react_component: step.custom_config.use_react_component,
        component_name: step.custom_config.component_name,
        component_props: step.custom_config.component_props,
      };
    }

    setStepForm(formData);
    setSelectedStepId(step.id);
    setEditMode(true);
    setStepDialogOpen(true);
  };

  // Handle flow selection
  const handleSelectFlow = (flow: BookingFlow) => {
    setSelectedFlow(flow);
    // Reset to INTRO tab when selecting a new flow
    setCurrentTab("INTRO");
  };

  // Handle tab change
  const handleTabChange = (tab: StepType) => {
    setCurrentTab(tab);
  };

  // Handle delete flow confirmation
  const handleDeleteFlow = () => {
    if (selectedFlow) {
      deleteFlow(selectedFlow.id);
      setDeleteFlowDialogOpen(false);
      setSelectedFlow(null);
    }
  };

  // Handle delete step confirmation
  const handleDeleteStep = () => {
    if (selectedStepId && selectedFlow) {
      deleteStep({
        id: selectedStepId,
        flowId: selectedFlow.id,
      });
      setDeleteStepDialogOpen(false);
      setSelectedStepId(null);
    }
  };

  // Handle adding a product item
  const handleAddProductItem = (
    configId: number,
    itemData: ProductStepItemFormData
  ) => {
    createProductItem({ configId, itemData });
  };

  // Handle updating a product item
  const handleUpdateProductItem = (
    id: number,
    itemData: Partial<ProductStepItemFormData>,
    configId: number
  ) => {
    updateProductItem({ id, itemData, configId });
  };

  // Handle deleting a product item
  const handleDeleteProductItem = (id: number, configId: number) => {
    deleteProductItem({ id, configId });
  };

  // Get current step's product config ID if it exists
  const getCurrentProductConfigId = (): number | undefined => {
    if (!selectedStepId || !flowSteps) return undefined;

    const step = flowSteps.find((s) => s.id === selectedStepId);
    if (
      step &&
      (step.step_type === "PRODUCT" || step.step_type === "ADDON") &&
      step.product_config
    ) {
      return step.product_config.id;
    }

    return undefined;
  };

  return (
    <SettingsLayout
      title="Booking Flows"
      description="Manage booking flows for your events"
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
                .filter((flow) => !showActiveOnly || flow.is_active)
                .map((flow) => (
                  <ListItem key={flow.id} disablePadding sx={{ mb: 1 }}>
                    <BookingFlowItem
                      flow={flow}
                      selected={selectedFlow?.id === flow.id}
                      onSelect={handleSelectFlow}
                      onEdit={handleEditFlow}
                      onDelete={(flow) => {
                        setSelectedFlow(flow);
                        setDeleteFlowDialogOpen(true);
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </Box>

        {/* Main content area - Steps */}
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

              {/* Step type tabs */}
              <BookingStepTabs
                currentTab={currentTab}
                onChange={handleTabChange}
              />

              {/* Steps list */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetStepForm();
                    setStepDialogOpen(true);
                  }}
                >
                  Add Step
                </Button>
              </Box>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`steps-${currentTab}`}>
                  {(provided) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ mb: 4 }}
                    >
                      {getFilteredSteps().length === 0 ? (
                        <Alert severity="info">
                          No steps found for this section.
                          <Button
                            onClick={() => {
                              resetStepForm();
                              setStepDialogOpen(true);
                            }}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            Add a step
                          </Button>
                        </Alert>
                      ) : (
                        getFilteredSteps().map((step, index) => (
                          <BookingStepItem
                            key={step.id}
                            step={step}
                            index={index}
                            onEdit={(step) => {
                              handleEditStep(step);
                              setSelectedStepId(step.id);
                            }}
                            onDelete={(stepId) => {
                              setSelectedStepId(stepId);
                              setDeleteStepDialogOpen(true);
                            }}
                            isReordering={isReorderingSteps}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Product Items Section (only shown when a product/addon step is selected) */}
              {selectedStepId && getCurrentProductConfigId() && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Products for this Step
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ProductStepItems
                    configId={getCurrentProductConfigId()!}
                    products={allProducts.filter((p) => p.is_active)}
                    onAddItem={handleAddProductItem}
                    onUpdateItem={handleUpdateProductItem}
                    onDeleteItem={handleDeleteProductItem}
                    onReorderItems={reorderProductItems}
                    isAddingItem={isCreatingProductItem}
                    isUpdatingItem={isUpdatingProductItem}
                    isDeletingItem={isDeletingProductItem}
                    isReorderingItems={isReorderingProductItems}
                  />
                </Box>
              )}
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
                manage its steps.
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

      {/* Step Dialog */}
      <BookingStepDialog
        open={stepDialogOpen}
        onClose={() => setStepDialogOpen(false)}
        onSave={handleSaveStep}
        stepForm={stepForm}
        stepFormErrors={stepFormErrors}
        onChange={handleStepFormChange}
        onStepTypeChange={handleStepTypeChange}
        onQuestionnaireChange={handleQuestionnaireChange}
        onProductSelectionTypeChange={handleProductSelectionTypeChange}
        questionnaires={questionnaires}
        products={allProducts.filter((p) => p.is_active)}
        isLoading={isCreatingStep || isUpdatingStep}
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
            {selectedFlow?.name}"? This will also delete all associated steps.
            This action cannot be undone.
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

      {/* Delete Step Confirmation Dialog */}
      <Dialog
        open={deleteStepDialogOpen}
        onClose={() => setDeleteStepDialogOpen(false)}
      >
        <DialogTitle>Delete Booking Step</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this booking step? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteStepDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteStep}
            variant="contained"
            color="error"
            disabled={isDeletingStep}
            startIcon={isDeletingStep && <CircularProgress size={16} />}
          >
            {isDeletingStep ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default BookingFlows;
