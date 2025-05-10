// frontend/admin-crm/src/pages/settings/workflows/Workflows.tsx
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  Add as AddIcon,
  Search as SearchIcon,
  ViewTimeline as TimelineIcon,
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
  Link,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  WorkflowStageDialog,
  WorkflowStageItem,
  WorkflowStageTabs,
  WorkflowTemplateDialog,
  WorkflowTemplateItem,
} from "../../../components/workflows";
import { useEmailTemplates } from "../../../hooks/useEmailTemplates";
import { useEventTypes } from "../../../hooks/useEventTypes"; // Use the dedicated hook
import { useWorkflows, useWorkflowTemplate } from "../../../hooks/useWorkflows";
import { EventType } from "../../../types/events.types";
import {
  StageType,
  WorkflowStage,
  WorkflowStageFormData,
  WorkflowStageFormErrors,
  WorkflowTemplate,
  WorkflowTemplateFormData,
  WorkflowTemplateFormErrors,
} from "../../../types/workflows.types";

const Workflows: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [page, setPage] = useState(0);

  // State for selected template and tab
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [currentTab, setCurrentTab] = useState<StageType>("LEAD");

  // State for dialogs
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] =
    useState(false);
  const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const initialTemplateForm: WorkflowTemplateFormData = {
    name: "",
    description: "",
    event_type: null,
    is_active: true,
  };
  const [templateForm, setTemplateForm] =
    useState<WorkflowTemplateFormData>(initialTemplateForm);
  const [templateFormErrors, setTemplateFormErrors] =
    useState<WorkflowTemplateFormErrors>({});

  // Updated initialStageForm with new workflow engine fields
  const initialStageForm: WorkflowStageFormData = {
    name: "",
    stage: "LEAD",
    order: 1,
    is_automated: false,
    task_description: "",
    template: 0,
    automation_type: "",
    trigger_time: "",
    email_template: null,
    // New fields for workflow engine
    progression_condition: "",
    required_tasks_completed: false,
    metadata: {},
  };

  const [stageForm, setStageForm] =
    useState<WorkflowStageFormData>(initialStageForm);
  const [stageFormErrors, setStageFormErrors] =
    useState<WorkflowStageFormErrors>({});

  // Use custom hooks for data fetching
  const {
    templates,
    totalCount,
    isLoading,
    createTemplate,
    isCreatingTemplate,
    updateTemplate,
    isUpdatingTemplate,
    deleteTemplate,
    isDeletingTemplate,
    createStage,
    isCreatingStage,
    updateStage,
    isUpdatingStage,
    deleteStage,
    isDeletingStage,
    reorderStages,
    isReorderingStages,
  } = useWorkflows(page + 1, eventTypeFilter || undefined, searchTerm);

  const {
    template: templateDetails,
    stages: templateStages,
    isLoading: isLoadingTemplate,
    refetchStages,
  } = useWorkflowTemplate(selectedTemplate?.id);

  const { eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();

  const {
    templates: emailTemplates,
    isLoadingTemplates: isLoadingEmailTemplates,
  } = useEmailTemplates();

  // Get stages for current template and tab
  const getFilteredStages = (): WorkflowStage[] => {
    if (!templateStages) return [];
    return templateStages
      .filter((stage) => stage.stage === currentTab)
      .sort((a, b) => a.order - b.order);
  };

  // Handle template form change
  const handleTemplateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setTemplateForm({
      ...templateForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (templateFormErrors[name as keyof WorkflowTemplateFormErrors]) {
      setTemplateFormErrors({
        ...templateFormErrors,
        [name]: undefined,
      });
    }
  };

  // Handle event type change
  const handleEventTypeChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setTemplateForm({
      ...templateForm,
      event_type: value,
    });
  };

  // Validate template form
  const validateTemplateForm = (): boolean => {
    const errors: WorkflowTemplateFormErrors = {};
    let isValid = true;

    if (!templateForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    setTemplateFormErrors(errors);
    return isValid;
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (validateTemplateForm()) {
      if (editMode && selectedTemplate) {
        updateTemplate({ id: selectedTemplate.id, templateData: templateForm });
      } else {
        createTemplate(templateForm);
      }
      setTemplateDialogOpen(false);
      resetTemplateForm();
    }
  };

  // Handle stage form change
  const handleStageFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setStageForm({
      ...stageForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (stageFormErrors[name as keyof WorkflowStageFormErrors]) {
      setStageFormErrors({
        ...stageFormErrors,
        [name]: undefined,
      });
    }
  };

  // Handle stage type change
  const handleStageTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStageForm({
      ...stageForm,
      stage: e.target.value as StageType,
    });
  };

  // Handle email template change
  const handleEmailTemplateChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setStageForm({
      ...stageForm,
      email_template: value,
    });
  };

  // Handle progression condition change
  const handleProgressionConditionChange = (e: SelectChangeEvent<string>) => {
    const syntheticEvent = {
      target: {
        name: "progression_condition",
        value: e.target.value,
        type: "select",
        checked: false,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleStageFormChange(syntheticEvent);
  };

  // Handle metadata updates
  const handleMetadataChange = (key: string, value: any) => {
    setStageForm({
      ...stageForm,
      metadata: {
        ...stageForm.metadata,
        [key]: value,
      },
    });
  };

  // Validate stage form
  const validateStageForm = (): boolean => {
    const errors: WorkflowStageFormErrors = {};
    let isValid = true;

    if (!stageForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (stageForm.order <= 0) {
      errors.order = "Order must be a positive number";
      isValid = false;
    }

    if (stageForm.is_automated) {
      if (!stageForm.automation_type) {
        errors.automation_type = "Automation type is required";
        isValid = false;
      }

      if (!stageForm.trigger_time) {
        errors.trigger_time = "Trigger time is required";
        isValid = false;
      }

      if (stageForm.automation_type === "EMAIL" && !stageForm.email_template) {
        errors.email_template =
          "Email template is required for email automation";
        isValid = false;
      }

      // Validate metadata based on automation type
      if (
        stageForm.automation_type === "CONTRACT" &&
        (!stageForm.metadata || !stageForm.metadata.contract_template_id)
      ) {
        errors.metadata =
          "Contract template is required for contract automation";
        isValid = false;
      }
    }

    setStageFormErrors(errors);
    return isValid;
  };

  // Handle save stage
  const handleSaveStage = () => {
    if (!selectedTemplate) return;

    if (validateStageForm()) {
      // Make sure stageForm includes the template
      const updatedStageForm = {
        ...stageForm,
        template: selectedTemplate.id, // Always include the template ID
      };

      if (editMode && selectedStageId) {
        updateStage({
          id: selectedStageId,
          stageData: updatedStageForm,
          templateId: selectedTemplate.id,
        });
      } else {
        createStage({
          templateId: selectedTemplate.id,
          stageData: updatedStageForm,
        });
      }
      setStageDialogOpen(false);
      resetStageForm();
    }
  };

  // Handle drag end for reordering stages
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedTemplate) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const filteredStages = getFilteredStages();

    // Create a copy of the filtered stages for reordering
    const newStages = Array.from(filteredStages);
    const [movedStage] = newStages.splice(startIndex, 1);
    newStages.splice(endIndex, 0, movedStage);

    // Create the order mapping based on the new positions
    const orderMapping: { [key: string]: number } = {};
    newStages.forEach((stage, index) => {
      orderMapping[stage.id.toString()] = index + 1;
    });

    // Call the reorderStages mutation with the new order mapping
    reorderStages({
      template_id: selectedTemplate.id,
      stage_type: currentTab,
      order_mapping: orderMapping,
    });
  };

  // Reset template form
  const resetTemplateForm = () => {
    setTemplateForm(initialTemplateForm);
    setTemplateFormErrors({});
    setEditMode(false);
  };

  // Reset stage form
  const resetStageForm = () => {
    // Set default order to next available order
    const nextOrder = getFilteredStages().length + 1;
    setStageForm({
      ...initialStageForm,
      stage: currentTab,
      order: nextOrder,
    });
    setStageFormErrors({});
    setEditMode(false);
    setSelectedStageId(null);
  };

  // Handle edit template
  const handleEditTemplate = (template: WorkflowTemplate) => {
    setTemplateForm({
      name: template.name,
      description: template.description,
      event_type: template.event_type
        ? typeof template.event_type === "number"
          ? template.event_type
          : template.event_type.id
        : null,
      is_active: template.is_active,
    });
    setEditMode(true);
    setTemplateDialogOpen(true);
  };

  // Handle edit stage
  const handleEditStage = (stage: WorkflowStage) => {
    setStageForm({
      name: stage.name,
      stage: stage.stage,
      order: stage.order,
      is_automated: stage.is_automated,
      automation_type: stage.automation_type,
      trigger_time: stage.trigger_time,
      email_template: stage.email_template
        ? typeof stage.email_template === "number"
          ? stage.email_template
          : stage.email_template.id
        : null,
      task_description: stage.task_description,
      template: stage.template,
      // New fields
      progression_condition: stage.progression_condition || "",
      required_tasks_completed: stage.required_tasks_completed || false,
      metadata: stage.metadata || {},
    });
    setSelectedStageId(stage.id);
    setEditMode(true);
    setStageDialogOpen(true);
  };

  // Handle template selection
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    // Reset to LEAD tab when selecting a new template
    setCurrentTab("LEAD");
  };

  // Handle tab change
  const handleTabChange = (tab: StageType) => {
    setCurrentTab(tab);
  };

  // Handle delete template confirmation
  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      deleteTemplate(selectedTemplate.id);
      setDeleteTemplateDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  // Handle delete stage confirmation
  const handleDeleteStage = () => {
    if (selectedStageId && selectedTemplate) {
      deleteStage({
        id: selectedStageId,
        templateId: selectedTemplate.id,
      });
      setDeleteStageDialogOpen(false);
      setSelectedStageId(null);
    }
  };

  // Handle adding new stage
  const handleAddNewStage = () => {
    if (selectedTemplate) {
      resetStageForm();
      setStageForm({
        ...initialStageForm,
        stage: currentTab,
        order: getFilteredStages().length + 1,
      });
      setStageDialogOpen(true);
    } else {
      toast.error("Please select a template first");
    }
  };

  return (
    <SettingsLayout
      title="Workflow Templates"
      description="Manage standardized workflows for your events"
    >
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* Left sidebar - Template list */}
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
              placeholder="Search templates..."
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
                resetTemplateForm();
                setTemplateDialogOpen(true);
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
                  setEventTypeFilter(e.target.value as number | null)
                }
                label="Filter by Event Type"
              >
                <MenuItem value="">All Event Types</MenuItem>
                {eventTypes.map((eventType: EventType) => (
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
          ) : templates.length === 0 ? (
            <Alert severity="info">No templates found</Alert>
          ) : (
            <List sx={{ overflow: "auto", maxHeight: "calc(100vh - 300px)" }}>
              {templates
                .filter((template) => !showActiveOnly || template.is_active)
                .map((template) => (
                  <ListItem key={template.id} disablePadding sx={{ mb: 1 }}>
                    <WorkflowTemplateItem
                      template={template}
                      selected={selectedTemplate?.id === template.id}
                      onSelect={handleSelectTemplate}
                      onEdit={handleEditTemplate}
                      onDelete={(template) => {
                        setSelectedTemplate(template);
                        setDeleteTemplateDialogOpen(true);
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </Box>

        {/* Main content area - Stages */}
        <Box sx={{ flexGrow: 1 }}>
          {selectedTemplate ? (
            <>
              {selectedTemplate && templateDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">{templateDetails.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {templateDetails.description}
                  </Typography>

                  <Box
                    sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {templateDetails.event_type &&
                      typeof templateDetails.event_type !== "number" && (
                        <Chip
                          label={`Event Type: ${templateDetails.event_type.name}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}

                    <Chip
                      label={templateDetails.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={templateDetails.is_active ? "success" : "default"}
                    />

                    <Chip
                      label={`Created ${formatDistanceToNow(
                        new Date(templateDetails.created_at),
                        { addSuffix: true }
                      )}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}
              {selectedTemplate && isLoadingTemplate && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress />
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Stage type tabs */}
              <WorkflowStageTabs
                currentTab={currentTab}
                onChange={handleTabChange}
              />

              {/* Stages list */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewStage}
                >
                  Add Stage
                </Button>
              </Box>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`stages-${currentTab}`}>
                  {(provided) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ mb: 4 }}
                    >
                      {getFilteredStages().length === 0 ? (
                        <Alert severity="info">
                          No stages found for this section.
                          <Link
                            component="button"
                            variant="body2"
                            onClick={handleAddNewStage}
                            sx={{ ml: 1 }}
                          >
                            Add a stage
                          </Link>
                        </Alert>
                      ) : (
                        getFilteredStages().map((stage, index) => (
                          <WorkflowStageItem
                            key={stage.id}
                            stage={stage}
                            index={index}
                            onEdit={handleEditStage}
                            onDelete={(stageId: number) => {
                              setSelectedStageId(stageId);
                              setDeleteStageDialogOpen(true);
                            }}
                            isReordering={isReorderingStages} // Pass the loading state
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
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
              <TimelineIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                No Template Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Select a template from the sidebar or create a new one to manage
                its workflow stages
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                  resetTemplateForm();
                  setTemplateDialogOpen(true);
                }}
              >
                Create New Template
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Template Dialog */}
      <WorkflowTemplateDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSave={handleSaveTemplate}
        templateForm={templateForm}
        templateFormErrors={templateFormErrors}
        onChange={handleTemplateFormChange}
        onEventTypeChange={handleEventTypeChange}
        eventTypes={eventTypes}
        isLoading={isCreatingTemplate || isUpdatingTemplate}
        editMode={editMode}
      />

      {/* Stage Dialog - The dialog component itself is in a separate file */}
      <WorkflowStageDialog
        open={stageDialogOpen}
        onClose={() => setStageDialogOpen(false)}
        onSave={handleSaveStage}
        stageForm={stageForm}
        stageFormErrors={stageFormErrors}
        onChange={handleStageFormChange}
        onStageTypeChange={handleStageTypeChange}
        onEmailTemplateChange={handleEmailTemplateChange}
        onProgressionConditionChange={handleProgressionConditionChange}
        onMetadataChange={handleMetadataChange}
        emailTemplates={emailTemplates}
        isLoading={isCreatingStage || isUpdatingStage}
        editMode={editMode}
      />

      {/* Delete Template Confirmation Dialog */}
      <Dialog
        open={deleteTemplateDialogOpen}
        onClose={() => setDeleteTemplateDialogOpen(false)}
      >
        <DialogTitle>Delete Workflow Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the workflow template "
            {selectedTemplate?.name}"? This will also delete all associated
            stages. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTemplateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTemplate}
            variant="contained"
            color="error"
            disabled={isDeletingTemplate}
            startIcon={isDeletingTemplate && <CircularProgress size={16} />}
          >
            {isDeletingTemplate ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Stage Confirmation Dialog */}
      <Dialog
        open={deleteStageDialogOpen}
        onClose={() => setDeleteStageDialogOpen(false)}
      >
        <DialogTitle>Delete Workflow Stage</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this workflow stage? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteStageDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteStage}
            variant="contained"
            color="error"
            disabled={isDeletingStage}
            startIcon={isDeletingStage && <CircularProgress size={16} />}
          >
            {isDeletingStage ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default Workflows;
