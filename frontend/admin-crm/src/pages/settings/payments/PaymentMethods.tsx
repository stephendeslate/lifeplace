// frontend/admin-crm/src/pages/settings/payments/PaymentMethods.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
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
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
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
import { format } from "date-fns";
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  usePaymentGateways,
  usePaymentMethods,
} from "../../../hooks/usePayments";
import {
  PaymentMethodFormData,
  PaymentMethodType,
} from "../../../types/payments.types";

interface PaymentMethodFormErrors {
  type?: string;
  nickname?: string;
  instructions?: string;
  gateway?: string;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    number | null
  >(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [formData, setFormData] = useState<Partial<PaymentMethodFormData>>({
    type: "CREDIT_CARD",
    is_default: false,
  });
  const [formErrors, setFormErrors] = useState<PaymentMethodFormErrors>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    paymentMethods,
    isLoading: isLoadingMethods,
    createPaymentMethod,
    isCreating,
    updatePaymentMethod,
    isUpdating,
    deletePaymentMethod,
    isDeleting,
  } = usePaymentMethods();

  const { activeGateways, isLoadingActive } = usePaymentGateways();

  const isProcessing = isCreating || isUpdating || isDeleting;
  const isLoading = isLoadingMethods || isLoadingActive;

  // Handle opening the create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      type: "CREDIT_CARD",
      is_default: false,
    });
    setFormErrors({});
    setIsEditMode(false);
    setPaymentMethodDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod.id);
    setFormData({
      type: paymentMethod.type,
      nickname: paymentMethod.nickname,
      instructions: paymentMethod.instructions,
      is_default: paymentMethod.is_default,
      gateway:
        typeof paymentMethod.gateway === "object"
          ? paymentMethod.gateway.id
          : paymentMethod.gateway,
      last_four: paymentMethod.last_four,
      expiry_date: paymentMethod.expiry_date,
      token_reference: paymentMethod.token_reference,
    });
    setFormErrors({});
    setIsEditMode(true);
    setPaymentMethodDialogOpen(true);
    setActionMenuAnchor(null);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setPaymentMethodDialogOpen(false);
    setFormData({
      type: "CREDIT_CARD",
      is_default: false,
    });
    setFormErrors({});
  };

  // Handle opening action menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    paymentMethodId: number
  ) => {
    setSelectedPaymentMethod(paymentMethodId);
    setActionMenuAnchor(event.currentTarget);
  };

  // Handle closing action menu
  const handleMenuClose = () => {
    setActionMenuAnchor(null);
  };

  // Handle form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when field is edited
      if (formErrors[name as keyof PaymentMethodFormErrors]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
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
    const errors: PaymentMethodFormErrors = {};

    if (!formData.type) {
      errors.type = "Payment method type is required";
    }

    if (!formData.nickname) {
      errors.nickname = "Nickname is required";
    }

    // Set errors if any
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit form
    if (isEditMode && selectedPaymentMethod) {
      updatePaymentMethod({
        id: selectedPaymentMethod,
        methodData: formData,
      });
    } else {
      createPaymentMethod(formData as PaymentMethodFormData);
    }

    // Close dialog
    setPaymentMethodDialogOpen(false);
    setFormData({
      type: "CREDIT_CARD",
      is_default: false,
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
    if (selectedPaymentMethod) {
      deletePaymentMethod(selectedPaymentMethod);
    }
    setDeleteDialogOpen(false);
  };

  // Payment method type options
  const paymentMethodTypes: { value: PaymentMethodType; label: string }[] = [
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHECK", label: "Check" },
    { value: "CASH", label: "Cash" },
    { value: "DIGITAL_WALLET", label: "Digital Wallet" },
  ];

  return (
    <SettingsLayout
      title="Payment Methods"
      description="Configure and manage payment methods for your business"
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Payment Method
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : paymentMethods.length === 0 ? (
        <Alert severity="info">
          No payment methods configured. Click the button above to add your
          first payment method.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Gateway</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Default</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {method.nickname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={method.type_display}
                          color={
                            method.type === "CREDIT_CARD"
                              ? "primary"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {typeof method.gateway === "object"
                          ? method.gateway?.name
                          : method.gateway_details
                          ? method.gateway_details.name
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {method.type === "CREDIT_CARD" && method.last_four ? (
                          <>
                            **** {method.last_four}
                            {method.expiry_date &&
                              ` (Exp: ${format(
                                new Date(method.expiry_date),
                                "MM/yy"
                              )})`}
                          </>
                        ) : method.type === "BANK_TRANSFER" ? (
                          "Bank Transfer Details"
                        ) : method.type === "DIGITAL_WALLET" ? (
                          "Digital Wallet"
                        ) : (
                          method.instructions?.substring(0, 40) || "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {method.is_default && (
                          <Chip
                            label="Default"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, method.id)}
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

      {/* Add/Edit Payment Method Dialog */}
      <Dialog
        open={paymentMethodDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Edit Payment Method" : "Add Payment Method"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel>Payment Method Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                  label="Payment Method Type"
                  disabled={isEditMode} // Disable in edit mode
                >
                  {paymentMethodTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && (
                  <FormHelperText>{formErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="nickname"
                label="Nickname"
                value={formData.nickname || ""}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.nickname}
                helperText={formErrors.nickname}
              />
            </Grid>

            {(formData.type === "CREDIT_CARD" ||
              formData.type === "DIGITAL_WALLET") && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.gateway}>
                  <InputLabel>Payment Gateway</InputLabel>
                  <Select
                    name="gateway"
                    value={
                      formData.gateway === null ||
                      formData.gateway === undefined
                        ? ""
                        : formData.gateway.toString()
                    }
                    onChange={handleInputChange}
                    label="Payment Gateway"
                  >
                    <MenuItem value="">None</MenuItem>
                    {activeGateways.map((gateway) => (
                      <MenuItem key={gateway.id} value={gateway.id}>
                        {gateway.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.gateway && (
                    <FormHelperText>{formErrors.gateway}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {formData.type === "CREDIT_CARD" && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="last_four"
                    label="Last 4 Digits"
                    value={formData.last_four || ""}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="expiry_date"
                    label="Expiry Date (MM/YYYY)"
                    value={formData.expiry_date || ""}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="MM/YYYY"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="token_reference"
                    label="Token Reference (System Use)"
                    value={formData.token_reference || ""}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            {(formData.type === "BANK_TRANSFER" ||
              formData.type === "CHECK" ||
              formData.type === "CASH") && (
              <Grid item xs={12}>
                <TextField
                  name="instructions"
                  label="Payment Instructions"
                  value={formData.instructions || ""}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!formErrors.instructions}
                  helperText={formErrors.instructions}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_default"
                    checked={formData.is_default || false}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Set as default payment method"
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
              ? "Update Payment Method"
              : "Add Payment Method"}
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
            const selectedMethod = paymentMethods.find(
              (m) => m.id === selectedPaymentMethod
            );
            if (selectedMethod) {
              handleOpenEditDialog(selectedMethod);
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
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment method? This action
            cannot be undone.
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

export default PaymentMethods;
