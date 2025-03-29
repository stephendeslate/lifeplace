// frontend/admin-crm/src/pages/settings/payments/TaxRates.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Percent as PercentIcon,
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
import { useTaxRates } from "../../../hooks/usePayments";
import { TaxRateFormData } from "../../../types/payments.types";

interface TaxRateFormErrors {
  name?: string;
  rate?: string;
  region?: string;
}

const TaxRates: React.FC = () => {
  const [page, setPage] = useState(1);
  const [taxRateDialogOpen, setTaxRateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaxRate, setSelectedTaxRate] = useState<number | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [formData, setFormData] = useState<Partial<TaxRateFormData>>({
    is_default: false,
  });
  const [formErrors, setFormErrors] = useState<TaxRateFormErrors>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    taxRates,
    totalCount,
    isLoading,
    defaultTaxRate,
    isLoadingDefault,
    createTaxRate,
    isCreating,
    updateTaxRate,
    isUpdating,
    deleteTaxRate,
    isDeleting,
  } = useTaxRates(page);

  const isProcessing = isCreating || isUpdating || isDeleting;

  // Handle opening the create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      is_default: false,
      rate: 0,
    });
    setFormErrors({});
    setIsEditMode(false);
    setTaxRateDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = (taxRate: any) => {
    setSelectedTaxRate(taxRate.id);
    setFormData({
      name: taxRate.name,
      rate: taxRate.rate,
      region: taxRate.region,
      is_default: taxRate.is_default,
    });
    setFormErrors({});
    setIsEditMode(true);
    setTaxRateDialogOpen(true);
    setActionMenuAnchor(null);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setTaxRateDialogOpen(false);
    setFormData({
      is_default: false,
    });
    setFormErrors({});
  };

  // Handle opening action menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    taxRateId: number
  ) => {
    setSelectedTaxRate(taxRateId);
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
      [name]: name === "rate" ? parseFloat(value) : value,
    }));

    // Clear error when field is edited
    if (formErrors[name as keyof TaxRateFormErrors]) {
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
    const errors: TaxRateFormErrors = {};

    if (!formData.name) {
      errors.name = "Tax rate name is required";
    }

    if (formData.rate === undefined || formData.rate < 0) {
      errors.rate = "Valid tax rate is required";
    }

    // Set errors if any
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit form
    if (isEditMode && selectedTaxRate) {
      updateTaxRate({
        id: selectedTaxRate,
        taxRateData: formData,
      });
    } else {
      createTaxRate(formData as TaxRateFormData);
    }

    // Close dialog
    setTaxRateDialogOpen(false);
    setFormData({
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
    if (selectedTaxRate) {
      deleteTaxRate(selectedTaxRate);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <SettingsLayout
      title="Tax Rates"
      description="Configure and manage tax rates for your business"
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Tax Rate
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : taxRates.length === 0 ? (
        <Alert severity="info">
          No tax rates configured. Click the button above to add your first tax
          rate.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Default</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxRates.map((taxRate) => (
                    <TableRow key={taxRate.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PercentIcon
                            sx={{ mr: 1, color: "primary.main" }}
                            fontSize="small"
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {taxRate.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${taxRate.rate}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{taxRate.region || "All regions"}</TableCell>
                      <TableCell>
                        {taxRate.is_default && (
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
                          onClick={(e) => handleMenuOpen(e, taxRate.id)}
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

      {/* Add/Edit Tax Rate Dialog */}
      <Dialog
        open={taxRateDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? "Edit Tax Rate" : "Add Tax Rate"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Tax Rate Name"
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
                name="rate"
                label="Rate (%)"
                value={formData.rate !== undefined ? formData.rate : ""}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!formErrors.rate}
                helperText={formErrors.rate}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="region"
                label="Region/State"
                value={formData.region || ""}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.region}
                helperText={formErrors.region || "Leave blank for all regions"}
              />
            </Grid>

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
                label="Set as default tax rate"
              />
              <FormHelperText>
                The default tax rate will be applied to all products unless
                otherwise specified
              </FormHelperText>
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
              ? "Update Tax Rate"
              : "Add Tax Rate"}
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
            const selectedRate = taxRates.find((t) => t.id === selectedTaxRate);
            if (selectedRate) {
              handleOpenEditDialog(selectedRate);
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
        <DialogTitle>Delete Tax Rate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tax rate? This action cannot be
            undone and may affect product pricing calculations.
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

export default TaxRates;
