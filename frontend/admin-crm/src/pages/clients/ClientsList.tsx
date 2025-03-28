// frontend/admin-crm/src/pages/clients/ClientsList.tsx
import { Add as AddIcon, People as PeopleIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClientFilters,
  ClientForm,
  ClientList,
} from "../../components/clients";
import Layout from "../../components/common/Layout";
import { useClients } from "../../hooks/useClients";
import {
  Client,
  ClientFilters as ClientFiltersType,
  ClientFormData,
} from "../../types/clients.types";

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ClientFiltersType>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const initialFormValues: ClientFormData = {
    email: "",
    first_name: "",
    last_name: "",
    profile: {
      phone: "",
      company: "",
    },
    is_active: true,
    send_invitation: false,
  };

  const {
    clients,
    totalCount,
    isLoading,
    createClient,
    isCreating,
    deactivateClient,
    isDeactivating,
    sendInvitation,
    isSendingInvitation,
  } = useClients(page + 1, filters);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: ClientFiltersType) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleCreateClient = (formData: ClientFormData) => {
    createClient(formData);
    setCreateDialogOpen(false);
  };

  const handleDeactivateClient = () => {
    if (selectedClient) {
      deactivateClient(selectedClient.id);
      setDeactivateDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleSendInvitation = (client: Client) => {
    setSelectedClient(client);
    setInvitationDialogOpen(true);
  };

  const handleConfirmSendInvitation = () => {
    if (selectedClient) {
      sendInvitation(selectedClient.id);
      setInvitationDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleViewClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleEditClient = (client: Client) => {
    navigate(`/clients/${client.id}/edit`);
  };

  return (
    <Layout>
      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PeopleIcon sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
              <Box>
                <Typography variant="h4">Clients</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Manage all clients
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              New Client
            </Button>
          </Box>

          <ClientFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <ClientList
            clients={clients}
            isLoading={isLoading}
            totalCount={totalCount}
            page={page}
            onPageChange={handlePageChange}
            onView={handleViewClient}
            onEdit={handleEditClient}
            onDeactivate={(client) => {
              setSelectedClient(client);
              setDeactivateDialogOpen(true);
            }}
            onSendInvitation={handleSendInvitation}
          />
        </Container>
      </Box>

      {/* Create Client Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Client</DialogTitle>
        <DialogContent>
          <ClientForm
            initialValues={initialFormValues}
            onSubmit={handleCreateClient}
            isSubmitting={isCreating}
            editMode={false}
            showInviteOption={true}
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
            Are you sure you want to deactivate the client "
            {selectedClient?.first_name} {selectedClient?.last_name}"? The
            client will no longer be able to log in or access their account.
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

      {/* Send Invitation Dialog */}
      <Dialog
        open={invitationDialogOpen}
        onClose={() => setInvitationDialogOpen(false)}
      >
        <DialogTitle>Send Account Invitation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send an invitation to {selectedClient?.first_name}{" "}
            {selectedClient?.last_name} ({selectedClient?.email}) to create an
            account? The client will receive an email with a link to set up
            their account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvitationDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSendInvitation}
            color="primary"
            variant="contained"
            disabled={isSendingInvitation}
          >
            {isSendingInvitation ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ClientsList;
