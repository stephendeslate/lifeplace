// frontend/admin-crm/src/components/clients/ClientList.tsx
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { Client } from "../../types/clients.types";

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (newPage: number) => void;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDeactivate: (client: Client) => void;
  onSendInvitation?: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  clients,
  isLoading,
  totalCount,
  page,
  onPageChange,
  onView,
  onEdit,
  onDeactivate,
  onSendInvitation,
}) => {
  // Handle page change
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    onPageChange(newPage);
  };

  // Helper to safely check if client has a password
  const hasPassword = (client: Client): boolean => {
    return client.password !== undefined && client.password !== "";
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No clients found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    {format(new Date(client.date_joined), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{client.first_name}</TableCell>
                  <TableCell>{client.last_name}</TableCell>
                  <TableCell>{client.profile?.company || "-"}</TableCell>
                  <TableCell>{client.profile?.phone || "-"}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {hasPassword(client) ? (
                      <Chip
                        label={client.is_active ? "Active" : "Inactive"}
                        color={client.is_active ? "success" : "default"}
                        size="small"
                      />
                    ) : (
                      <Chip label="No Account" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="View Client">
                        <IconButton
                          size="small"
                          onClick={() => onView(client)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Client">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(client)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!hasPassword(client) && onSendInvitation && (
                        <Tooltip title="Send Invitation">
                          <IconButton
                            size="small"
                            onClick={() => onSendInvitation(client)}
                            color="primary"
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip
                        title={
                          client.is_active
                            ? "Deactivate Client"
                            : "Client Inactive"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onDeactivate(client)}
                            color="error"
                            disabled={!client.is_active}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={totalCount}
        rowsPerPage={10}
        page={page}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
};

export default ClientList;
