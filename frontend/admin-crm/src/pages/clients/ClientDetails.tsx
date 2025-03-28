// frontend/admin-crm/src/pages/clients/ClientDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClientDetail,
  ClientEvents,
  ClientForm,
} from "../../components/clients";
import Layout from "../../components/common/Layout";
import { useClient } from "../../hooks/useClients";
import { ClientFormData } from "../../types/clients.types";

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
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ClientDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : 0;
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const {
    client,
    isLoading,
    error,
    events,
    isLoadingEvents,
    updateClient,
    isUpdating,
    deactivateClient,
    isDeactivating,
  } = useClient(clientId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBackToList = () => {
    navigate("/clients");
  };

  const handleEditClient = () => {
    setEditDialogOpen(true);
  };

  const handleUpdateClient = (formData: ClientFormData) => {
    updateClient(formData);
    setEditDialogOpen(false);
  };

  const handleDeactivateClient = () => {
    if (client) {
      deactivateClient();
      setDeactivateDialogOpen(false);
      // Navigate back to clients list after deactivation
      navigate("/clients");
    }
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}`);
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

  if (error || !client) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              Error loading client. The client may not exist or you may not have
              permission to view it.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              sx={{ mt: 2 }}
            >
              Back to Clients
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Prepare initial form values for edit
  const initialFormValues: ClientFormData = {
    email: client.email,
    first_name: client.first_name,
    last_name: client.last_name,
    profile: {
      phone: client.profile?.phone || "",
      company: client.profile?.company || "",
    },
    is_active: client.is_active,
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header with back button and client name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
            >
              Back to Clients
            </Button>

            <Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClient}
                sx={{ mr: 1 }}
              >
                Edit Client
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeactivateDialogOpen(true)}
              >
                Deactivate Client
              </Button>
            </Box>
          </Box>

          {/* Client detail card */}
          <ClientDetail client={client} />

          {/* Tabs navigation */}
          <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Events" />
              <Tab label="Notes" />
              <Tab label="Communications" />
              <Tab label="Documents" />
            </Tabs>
          </Box>

          {/* Tab panels */}
          <TabPanel value={activeTab} index={0}>
            <ClientEvents
              events={events || []}
              isLoading={isLoadingEvents}
              onViewEvent={handleViewEvent}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Alert severity="info">
              Notes functionality will be implemented in a future update.
            </Alert>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Alert severity="info">
              Communications functionality will be implemented in a future
              update.
            </Alert>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Alert severity="info">
              Documents functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
        </Box>
      </Container>

      {/* Edit Client Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <ClientForm
            initialValues={initialFormValues}
            onSubmit={handleUpdateClient}
            isSubmitting={isUpdating}
            editMode={true}
          />
        </DialogContent>
      </Dialog>

      {/* Deactivate Client Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
      >
        <DialogTitle>Deactivate Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate the client "{client.first_name}{" "}
            {client.last_name}"? The client will no longer be able to log in or
            access their account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeactivateClient}
            color="error"
            variant="contained"
            disabled={isDeactivating}
          >
            {isDeactivating ? "Deactivating..." : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ClientDetails;
