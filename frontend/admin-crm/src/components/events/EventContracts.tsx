// frontend/admin-crm/src/components/events/EventContracts.tsx
import {
  Add as AddIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { contractsApi } from "../../apis/contracts.api";
import { useEventContracts } from "../../hooks/useContracts";
import { useEventTypes } from "../../hooks/useEventTypes";
import {
  ContractTemplate,
  EventContract,
  EventContractFormData,
} from "../../types/contracts.types";
import { Event } from "../../types/events.types";
import { ContractForm, ContractList } from "../contracts";

interface EventContractsProps {
  event: Event;
  canEdit?: boolean;
}

const EventContracts: React.FC<EventContractsProps> = ({
  event,
  canEdit = true,
}) => {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<EventContract | null>(null);

  // Get event type from the event
  const eventTypeId =
    typeof event.event_type === "object"
      ? event.event_type.id
      : event.event_type || undefined;

  // Get contract templates for this event type
  const { eventTypes } = useEventTypes();
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);

  React.useEffect(() => {
    // Fetch templates for this event type
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        let response;
        if (eventTypeId) {
          response = await contractsApi.getTemplatesForEventType(eventTypeId);
        } else {
          response = await contractsApi.getContractTemplates(1);
        }
        setTemplates(response.results || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [eventTypeId]);

  // Get contracts for this event
  const {
    contracts,
    isLoading,
    createContract,
    isCreating,
    sendContract,
    isSending,
    voidContract,
    isVoiding,
  } = useEventContracts(event.id);

  // Handle creating a new contract
  const handleCreateContract = (formData: EventContractFormData) => {
    createContract(formData);
    setCreateDialogOpen(false);
  };

  // Handle sending a contract to client
  const handleSendContract = (contract: EventContract) => {
    sendContract(contract.id);
  };

  // Handle voiding a contract
  const handleVoidContract = () => {
    if (selectedContract) {
      voidContract({ id: selectedContract.id, reason: "Voided by admin" });
      setVoidDialogOpen(false);
      setSelectedContract(null);
    }
  };

  // Handle viewing a contract
  const handleViewContract = (contract: EventContract) => {
    navigate(`/contracts/${contract.id}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with action button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Contracts {contracts.length > 0 && `(${contracts.length})`}
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={isCreating}
          >
            New Contract
          </Button>
        )}
      </Box>

      {/* Contract list */}
      {contracts.length === 0 ? (
        <Alert
          severity="info"
          icon={<DescriptionIcon />}
          sx={{ alignItems: "flex-start" }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              No contracts found
            </Typography>
            <Typography variant="body2">
              {canEdit
                ? "Create a new contract using the button above."
                : "There are no contracts associated with this event yet."}
            </Typography>
          </Box>
        </Alert>
      ) : (
        <ContractList
          contracts={contracts}
          isLoading={isLoading}
          onView={handleViewContract}
          onSend={canEdit ? handleSendContract : undefined}
          onVoid={
            canEdit
              ? (contract) => {
                  setSelectedContract(contract);
                  setVoidDialogOpen(true);
                }
              : undefined
          }
        />
      )}

      {/* Create Contract Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Contract</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <ContractForm
              events={[event]} // Only include the current event
              templates={templates}
              initialValues={{
                event: event.id,
                template: 0,
              }}
              onSubmit={handleCreateContract}
              isLoading={isCreating}
              loadingTemplates={loadingTemplates}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Void Contract Dialog */}
      <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)}>
        <DialogTitle>Void Contract</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to void this contract? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Button onClick={() => setVoidDialogOpen(false)} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleVoidContract}
            disabled={isVoiding}
          >
            {isVoiding ? "Voiding..." : "Void Contract"}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default EventContracts;
