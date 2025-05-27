// frontend/admin-crm/src/pages/events/EventDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Person as ClientIcon,
  SecurityOutlined as ContractIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  FileCopy as FilesIcon,
  Receipt as InvoiceIcon,
  Note as NoteIcon,
  Assignment as QuestionnaireIcon,
  RequestQuote as QuoteIcon,
  ViewTimeline as WorkflowIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { EventProgress, EventStatusChip } from "../../components/events";
import EventContracts from "../../components/events/EventContracts";
import EventQuotesCard from "../../components/events/EventQuotesCard";
import { NotesTab } from "../../components/notes";
import WorkflowProgress from "../../components/workflows/WorkflowProgress";
import { useEvent } from "../../hooks/useEvents";
import { useWorkflowProgress } from "../../hooks/useWorkflowProgress";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const EventDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : 0;
  const [activeTab, setActiveTab] = useState(0);

  const { event, isLoading, error } = useEvent(eventId);

  // Add workflow progress hook
  const {
    stages,
    currentStage,
    progress,
    isLoading: isLoadingWorkflow,
  } = useWorkflowProgress(event ?? null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle navigation back to events list
  const handleBackToList = () => {
    navigate("/events");
  };

  const handleViewQuotes = () => {
    navigate(`/sales/events/${eventId}/quotes`);
  };

  const handleCreateQuote = () => {
    navigate(`/sales/quotes/new?eventId=${eventId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              Error loading event. The event may not exist or you may not have
              permission to view it.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              sx={{ mt: 2 }}
            >
              Back to Events
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header with back button and event name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
            >
              Back to Events
            </Button>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EventStatusChip status={event.status} sx={{ mr: 1 }} />
              <Button variant="contained" color="primary">
                Edit Event
              </Button>
            </Box>
          </Box>

          {/* Event title and key info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {event.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {new Date(event.start_date).toLocaleDateString()}
                  {event.end_date &&
                    ` - ${new Date(event.end_date).toLocaleDateString()}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ClientIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{event.client_name}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{event.event_type_name}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Workflow Progress Section - NEW ADDITION */}
          {event.workflow_template && (
            <WorkflowProgress
              stages={stages}
              currentStageId={
                typeof event.current_stage === "number"
                  ? event.current_stage
                  : null
              }
              progress={progress}
            />
          )}

          {/* Original Progress bar - Keep for backward compatibility */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Workflow Progress:
              {event.current_stage_name
                ? ` ${event.current_stage_name}`
                : " Not started"}
            </Typography>
            <EventProgress
              progress={event.workflow_progress}
              showPercentage
              height={12}
            />
          </Box>

          {/* Tabs navigation */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Overview" />
            <Tab label="Tasks" />
            <Tab label="Timeline" />
            <Tab label="Files" />
            <Tab label="Notes" />
            <Tab label="Contracts" />
            <Tab label="Quotes" />
            <Tab label="Messages" />
            {/* Add a new tab for workflow management */}
            <Tab
              label="Workflow"
              icon={<WorkflowIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab content */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Event Details card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Event Details" />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the event details section. This
                      will include information such as date, time, location, and
                      other event specifics.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Client Details card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Client Details" avatar={<ClientIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the client details section. This
                      will include client contact information, preferences, and
                      history.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Invoices card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Invoices" avatar={<InvoiceIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the invoices section. This will
                      include a list of invoices, their status, and payment
                      history.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quotes card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Quotes" avatar={<QuoteIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the quotes section. This will
                      include a list of quotes provided to the client.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contracts card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Contracts" avatar={<ContractIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the contracts section. This will
                      include contract documents, signatures, and related
                      information.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Emails card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Emails" avatar={<EmailIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the emails section. This will
                      include a history of email communications with the client.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Questionnaires card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="Questionnaires"
                    avatar={<QuestionnaireIcon />}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the questionnaires section. This
                      will include client-completed questionnaires and
                      preferences.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Files card */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Files" avatar={<FilesIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the files section. This will
                      include a list of files related to the event, such as
                      photos, documents, etc.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes card */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Notes" avatar={<NoteIcon />} />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      This is a placeholder for the notes section. This will
                      include internal notes and comments about the event.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for the tasks tab. This section will show
              all tasks related to this event, their status, due dates, and
              assigned team members.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for the timeline tab. This section will show
              a chronological history of all activities related to this event.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for the files tab. This section will show
              all files and documents uploaded for this event, organized by
              category.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <NotesTab contentType="event" objectId={eventId} />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <EventContracts event={event} canEdit={true} />
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <EventQuotesCard event={event} />
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <Typography variant="body2" color="text.secondary">
              This is a placeholder for the messages tab. This section will show
              all communication with the client related to this event.
            </Typography>
          </TabPanel>

          {/* New Workflow tab */}
          <TabPanel value={activeTab} index={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Workflow Management
              </Typography>

              {isLoadingWorkflow ? (
                <CircularProgress size={24} sx={{ mt: 2 }} />
              ) : (
                <>
                  {event.workflow_template ? (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        gutterBottom
                      >
                        Current Workflow:{" "}
                        {event.workflow_template
                          ? currentStage?.name
                          : "None assigned"}
                      </Typography>

                      <WorkflowProgress
                        stages={stages}
                        currentStageId={
                          typeof event.current_stage === "number"
                            ? event.current_stage
                            : null
                        }
                        progress={progress}
                      />

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Workflow Tasks:
                        </Typography>
                        {/* This would eventually be replaced with a list of tasks for the current stage */}
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Tasks for the current stage will appear here. These
                          tasks are generated automatically based on the
                          workflow configuration.
                        </Alert>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No workflow has been assigned to this event yet. Assign a
                      workflow template to enable automated progression and task
                      creation.
                    </Alert>
                  )}

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!event.workflow_template}
                    >
                      Manage Workflow
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </TabPanel>
        </Box>
      </Container>
    </Layout>
  );
};

export default EventDetails;
