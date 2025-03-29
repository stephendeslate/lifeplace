// frontend/admin-crm/src/pages/settings/payments/PaymentGateways.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { usePaymentGateways } from "../../../hooks/usePayments";
import { PaymentGatewayFormData } from "../../../types/payments.types";

interface PaymentGatewayFormErrors {
  name?: string;
  code?: string;
  description?: string;
  config?: string;
}

// Create a specific interface for form state that includes config as a string
interface GatewayFormState {
  name?: string;
  code?: string;
  is_active?: boolean;
  description?: string;
  config?: string; // String for the form state
}

const PaymentGateways: React.FC = () => {
  // Use the page state but don't need to update it since we're not paginating in the UI
  const [page] = useState(1);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [formData, setFormData] = useState<GatewayFormState>({
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<PaymentGatewayFormErrors>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    gateways,
    isLoading,
    createGateway,
    isCreating,
    updateGateway,
    isUpdating,
    deleteGateway,
    isDeleting,
  } = usePaymentGateways(page);

  const isProcessing = isCreating || isUpdating || isDeleting;

  // Handle opening the create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      is_active: true,
      config: JSON.stringify({}, null, 2),
    });
    setFormErrors({});
    setIsEditMode(false);
    setGatewayDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = (gateway: any) => {
    setSelectedGateway(gateway.id);
    setFormData({
      name: gateway.name,
      code: gateway.code,
      is_active: gateway.is_active,
      description: gateway.description,
      config: gateway.config ? JSON.stringify(gateway.config, null, 2) : "{}",
    });
    setFormErrors({});
    setIsEditMode(true);
    setGatewayDialogOpen(true);
    setActionMenuAnchor(null);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setGatewayDialogOpen(false);
    setFormData({
      is_active: true,
    });
    setFormErrors({});
  };

  // Handle opening action menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    gatewayId: number
  ) => {
    setSelectedGateway(gatewayId);
    setActionMenuAnchor(event.currentTarget);
  };

  // Handle closing action menu
  const handleMenuClose = () => {
    setActionMenuAnchor(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (formErrors[name as keyof PaymentGatewayFormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle switch changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    const errors: PaymentGatewayFormErrors = {};

    if (!formData.name) {
      errors.name = "Gateway name is required";
    }

    if (!formData.code) {
      errors.code = "Gateway code is required";
    }

    // Validate config JSON if present
    if (formData.config) {
      try {
        JSON.parse(formData.config);
      } catch (e) {
        errors.config = "Invalid JSON format";
      }
    }

    // Set errors if any
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Create a submission data object properly typed for API
    const submissionData: Partial<PaymentGatewayFormData> = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      is_active: formData.is_active,
    };

    // Add the parsed config if present
    if (formData.config) {
      try {
        submissionData.config = JSON.parse(formData.config);
      } catch (e) {
        setFormErrors({
          ...errors,
          config: "Invalid JSON format",
        });
        return;
      }
    }

    // Submit form
    if (isEditMode && selectedGateway) {
      updateGateway({
        id: selectedGateway,
        gatewayData: submissionData,
      });
    } else {
      createGateway(submissionData as PaymentGatewayFormData);
    }

    // Close dialog
    setGatewayDialogOpen(false);
    setFormData({
      is_active: true,
    });
    setFormErrors({});
  };

  // Handle delete confirmation
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setActionMenuAnchor(null);
  };

  // Handle delete cancellation
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (selectedGateway) {
      deleteGateway(selectedGateway);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <SettingsLayout
      title="Payment Gateways"
      description="Configure and manage payment gateways for your business"
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Payment Gateway
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : gateways.length === 0 ? (
        <Alert severity="info">
          No payment gateways configured. Click the button above to add your
          first payment gateway.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gateways.map((gateway) => (
                    <TableRow key={gateway.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PaymentIcon
                            sx={{ mr: 1, color: "primary.main" }}
                            fontSize="small"
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {gateway.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={gateway.code}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {gateway.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={gateway.is_active ? "Active" : "Inactive"}
                          color={gateway.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, gateway.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Gateway Dialog */}
      <Dialog
        open={gatewayDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Edit Payment Gateway" : "Add Payment Gateway"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Gateway Name"
                value={formData.name || ""}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="code"
                label="Gateway Code"
                value={formData.code || ""}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.code}
                helperText={
                  formErrors.code ||
                  "Unique identifier for this gateway (e.g., stripe, paypal)"
                }
                disabled={isEditMode} // Disable in edit mode
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description || ""}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Configuration
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  border: (theme) =>
                    formErrors.config
                      ? `1px solid ${theme.palette.error.main}`
                      : undefined,
                }}
              >
                <TextField
                  name="config"
                  value={formData.config || "{}"}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="{}"
                  InputProps={{
                    sx: { fontFamily: "monospace", fontSize: "0.875rem" },
                  }}
                  error={!!formErrors.config}
                />
              </Paper>
              {formErrors.config && (
                <FormHelperText error>{formErrors.config}</FormHelperText>
              )}
              <FormHelperText>
                Enter the gateway configuration in JSON format
              </FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Gateway is active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isProcessing}
            startIcon={isProcessing && <CircularProgress size={20} />}
          >
            {isProcessing
              ? "Saving..."
              : isEditMode
              ? "Update Gateway"
              : "Add Gateway"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const selectedGatewayObj = gateways.find(
              (g) => g.id === selectedGateway
            );
            if (selectedGatewayObj) {
              handleOpenEditDialog(selectedGatewayObj);
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Payment Gateway</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment gateway? This action
            cannot be undone and may affect existing payment methods.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={20} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default PaymentGateways;
