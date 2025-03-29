// frontend/admin-crm/src/components/contracts/ContractDetail.tsx
import {
  Attachment as AttachmentIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { format, isValid } from "date-fns";
import React from "react";
import { EventContract } from "../../types/contracts.types";
import ContractStatusChip from "./ContractStatusChip";

interface ContractDetailProps {
  contract: EventContract;
}

const ContractDetail: React.FC<ContractDetailProps> = ({ contract }) => {
  // Format date as readable string or return placeholder
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMMM d, yyyy") : "Invalid date";
  };

  // Get template name from contract
  const getTemplateName = () => {
    if (typeof contract.template === "object") {
      return contract.template.name;
    }
    return contract.template_name || "Contract";
  };

  // Get client name from contract
  const getClientName = () => {
    if (typeof contract.event === "object" && contract.event.client_name) {
      return contract.event.client_name;
    }
    return "Client";
  };

  // Get event name from contract
  const getEventName = () => {
    if (typeof contract.event === "object") {
      return contract.event.name;
    }
    return "Event";
  };

  // Get signatory name
  const getSignatoryName = () => {
    if (!contract.signed_by) return "Not signed";

    if (typeof contract.signed_by === "object") {
      return `${contract.signed_by.first_name} ${contract.signed_by.last_name}`;
    }

    return "Client";
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">{getTemplateName()}</Typography>
          <ContractStatusChip status={contract.status} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* Event info */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <EventIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="subtitle2">Event</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              {getEventName()}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PersonIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="subtitle2">Client</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              {getClientName()}
            </Typography>
          </Grid>

          {/* Dates */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="subtitle2">Contract Dates</Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                component="span"
                color="text.secondary"
              >
                Created:
              </Typography>{" "}
              <Typography variant="body2" component="span">
                {formatDate(contract.created_at)}
              </Typography>
            </Box>

            {contract.sent_at && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  Sent:
                </Typography>{" "}
                <Typography variant="body2" component="span">
                  {formatDate(contract.sent_at)}
                </Typography>
              </Box>
            )}

            {contract.signed_at && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  Signed:
                </Typography>{" "}
                <Typography variant="body2" component="span">
                  {formatDate(contract.signed_at)}
                </Typography>
              </Box>
            )}

            {contract.valid_until && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  Valid until:
                </Typography>{" "}
                <Typography variant="body2" component="span">
                  {formatDate(contract.valid_until)}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Signature information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AttachmentIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="subtitle2">Signature Information</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    component="span"
                    color="text.secondary"
                  >
                    Signed by:
                  </Typography>{" "}
                  <Typography variant="body2" component="span">
                    {getSignatoryName()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                {contract.witness_name && (
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.secondary"
                    >
                      Witness:
                    </Typography>{" "}
                    <Typography variant="body2" component="span">
                      {contract.witness_name}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ContractDetail;
