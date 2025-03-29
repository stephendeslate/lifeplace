// frontend/admin-crm/src/components/contracts/ContractList.tsx
import {
  Description as DescriptionIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { EventContract } from "../../types/contracts.types";
import ContractStatusChip from "./ContractStatusChip";

interface ContractListProps {
  contracts: EventContract[];
  isLoading: boolean;
  onView: (contract: EventContract) => void;
  onSend?: (contract: EventContract) => void;
  onVoid?: (contract: EventContract) => void;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts,
  isLoading,
  onView,
  onSend,
  onVoid,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] =
    useState<EventContract | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    contract: EventContract
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleSend = () => {
    if (selectedContract && onSend) {
      onSend(selectedContract);
    }
    handleMenuClose();
  };

  const handleVoid = () => {
    if (selectedContract && onVoid) {
      onVoid(selectedContract);
    }
    handleMenuClose();
  };

  // Render placeholder when loading
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render empty state
  if (contracts.length === 0) {
    return (
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 5 }}>
          <DescriptionIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Contracts Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a contract using the button above
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Paper sx={{ borderRadius: 1 }}>
      <List sx={{ width: "100%" }}>
        {contracts.map((contract, index) => (
          <React.Fragment key={contract.id}>
            <ListItem
              button
              alignItems="flex-start"
              onClick={() => onView(contract)}
              sx={{ py: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DescriptionIcon color="primary" />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1" fontWeight="medium">
                      {typeof contract.template === "object"
                        ? contract.template.name
                        : contract.template_name || "Contract"}
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      <ContractStatusChip status={contract.status} />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {contract.sent_at && (
                      <Box component="span" mr={2}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          Sent:{" "}
                          {format(new Date(contract.sent_at), "MMM d, yyyy")}
                        </Typography>
                      </Box>
                    )}
                    {contract.signed_at && (
                      <Box component="span" mr={2}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          Signed:{" "}
                          {format(new Date(contract.signed_at), "MMM d, yyyy")}
                        </Typography>
                      </Box>
                    )}
                    {contract.valid_until && (
                      <Box component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          Valid until:{" "}
                          {format(
                            new Date(contract.valid_until),
                            "MMM d, yyyy"
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, contract);
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < contracts.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            if (selectedContract) onView(selectedContract);
            handleMenuClose();
          }}
        >
          View Contract
        </MenuItem>

        {selectedContract?.status === "DRAFT" && onSend && (
          <MenuItem onClick={handleSend}>Send to Client</MenuItem>
        )}

        {["DRAFT", "SENT"].includes(selectedContract?.status || "") &&
          onVoid && <MenuItem onClick={handleVoid}>Void Contract</MenuItem>}
      </Menu>
    </Paper>
  );
};

export default ContractList;
