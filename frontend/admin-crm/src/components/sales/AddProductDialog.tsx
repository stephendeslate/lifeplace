// frontend/admin-crm/src/components/sales/AddProductDialog.tsx
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React, { useState } from "react";
import { ProductOption } from "../../types/products.types";
import {
  QuoteTemplateProductFormData,
  QuoteTemplateProductFormErrors,
} from "../../types/sales.types";

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: QuoteTemplateProductFormData) => void;
  products: ProductOption[];
  isSubmitting: boolean;
  templateId?: number;
  initialValues?: Partial<QuoteTemplateProductFormData>;
  editMode?: boolean;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onClose,
  onSave,
  products,
  isSubmitting,
  templateId,
  initialValues,
  editMode = false,
}) => {
  const defaultValues: QuoteTemplateProductFormData = {
    product: 0,
    quantity: 1,
    is_required: false,
    template: templateId || 0,
  };

  const [formValues, setFormValues] = useState<QuoteTemplateProductFormData>(
    initialValues ? { ...defaultValues, ...initialValues } : defaultValues
  );
  const [formErrors, setFormErrors] = useState<QuoteTemplateProductFormErrors>(
    {}
  );

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormValues(
        initialValues ? { ...defaultValues, ...initialValues } : defaultValues
      );
      setFormErrors({});
    }
  }, [open, initialValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    });

    // Clear error on change
    if (formErrors[name as keyof QuoteTemplateProductFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleProductChange = (e: SelectChangeEvent<number>) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value);
    setFormValues({
      ...formValues,
      product: value,
    });

    // Clear error if needed
    if (formErrors.product) {
      setFormErrors({
        ...formErrors,
        product: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: QuoteTemplateProductFormErrors = {};
    let isValid = true;

    if (!formValues.product) {
      errors.product = "Product is required";
      isValid = false;
    }

    if (formValues.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formValues);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Product" : "Add Product to Template"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.product}>
                <InputLabel id="product-select-label">Product</InputLabel>
                <Select
                  labelId="product-select-label"
                  value={formValues.product}
                  onChange={handleProductChange}
                  label="Product"
                  disabled={editMode}
                >
                  <MenuItem value={0} disabled>
                    Select a product
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} -{" "}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: product.currency || "USD",
                      }).format(product.base_price)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.product && (
                  <FormHelperText>{formErrors.product}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                name="quantity"
                value={formValues.quantity}
                onChange={handleInputChange}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.is_required}
                    onChange={handleInputChange}
                    name="is_required"
                  />
                }
                label="Required Product (always included in quotes)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={16} />}
        >
          {isSubmitting ? "Saving..." : editMode ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
