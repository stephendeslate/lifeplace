// frontend/admin-crm/src/components/bookingflow/steps/AddonConfigForm.tsx
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddonConfig, AddonItem } from "../../../types/bookingflow.types";
import { ProductOption } from "../../../types/products.types";

interface AddonConfigFormProps {
  initialConfig?: AddonConfig;
  products: ProductOption[];
  onSave: (config: AddonConfig) => void;
  isLoading?: boolean;
}

const AddonConfigForm: React.FC<AddonConfigFormProps> = ({
  initialConfig,
  products,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: AddonConfig = {
    title: "Add-ons",
    description: "Enhance your booking with these optional add-ons.",
    min_selection: 0,
    max_selection: 0,
    addon_items: [],
    is_required: false,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<AddonConfig>(
    initialConfig || defaultConfig
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for adding new items
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [customDescription, setCustomDescription] = useState("");

  // Update form when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setConfig({
      ...config,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle product selection
  const handleProductChange = (e: SelectChangeEvent<string | number>) => {
    setSelectedProduct(e.target.value as number);
  };

  // Handle custom price change
  const handleCustomPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if value is empty or a valid number
    if (value === "" || !isNaN(parseFloat(value))) {
      setCustomPrice(value);
    }
  };

  // Add product to the list
  const handleAddAddon = () => {
    if (selectedProduct === "") return;

    // Check if product is already in the list
    const exists = config.addon_items.some((item) =>
      typeof item.product === "number"
        ? item.product === selectedProduct
        : item.product.id === selectedProduct
    );

    if (exists) {
      setErrors({
        ...errors,
        selectedProduct: "This product is already in the list",
      });
      return;
    }

    const nextOrder = config.addon_items.length + 1;

    const newItem: AddonItem = {
      product: selectedProduct as number,
      order: nextOrder,
      is_highlighted: isHighlighted,
      custom_price: customPrice ? parseFloat(customPrice) : undefined,
      custom_description: customDescription || undefined,
    };

    setConfig({
      ...config,
      addon_items: [...config.addon_items, newItem],
    });

    // Reset selection
    setSelectedProduct("");
    setIsHighlighted(false);
    setCustomPrice("");
    setCustomDescription("");

    // Clear error
    if (errors.selectedProduct) {
      setErrors({
        ...errors,
        selectedProduct: "",
      });
    }
  };

  // Remove product from the list
  const handleRemoveAddon = (index: number) => {
    const newItems = [...config.addon_items];
    newItems.splice(index, 1);

    // Reorder items
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setConfig({
      ...config,
      addon_items: reorderedItems,
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!config.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (config.min_selection < 0) {
      newErrors.min_selection = "Cannot be negative";
      isValid = false;
    }

    if (
      config.max_selection !== 0 &&
      config.max_selection < config.min_selection
    ) {
      newErrors.max_selection =
        "Must be greater than or equal to minimum selection";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(config);
    }
  };

  // Get product name by ID
  const getProductName = (id: number | ProductOption): string => {
    if (typeof id === "object") {
      return id.name;
    }

    const product = products.find((p) => p.id === id);
    return product ? product.name : `Product ${id}`;
  };

  // Get product price by ID
  const getProductPrice = (id: number | ProductOption): number => {
    if (typeof id === "object") {
      return id.base_price;
    }

    const product = products.find((p) => p.id === id);
    return product ? product.base_price : 0;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add-ons Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure optional add-ons that clients can select to enhance their
          booking.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={config.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={config.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Selection"
                name="min_selection"
                type="number"
                value={config.min_selection}
                onChange={handleChange}
                error={!!errors.min_selection}
                helperText={
                  errors.min_selection ||
                  "Minimum number of add-ons to select (0 means optional)"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Selection"
                name="max_selection"
                type="number"
                value={config.max_selection}
                onChange={handleChange}
                error={!!errors.max_selection}
                helperText={
                  errors.max_selection ||
                  (config.max_selection === 0
                    ? "No limit (0 means unlimited)"
                    : "Maximum number of add-ons to select")
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Available Add-ons
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.selectedProduct}>
                      <InputLabel id="product-select-label">
                        Select Add-on
                      </InputLabel>
                      <Select
                        labelId="product-select-label"
                        value={selectedProduct}
                        label="Select Add-on"
                        onChange={handleProductChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select an add-on
                        </MenuItem>
                        {products
                          .filter((p) => p.is_active)
                          .map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} (${product.base_price})
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.selectedProduct && (
                        <FormHelperText>
                          {errors.selectedProduct}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Price (Optional)"
                      value={customPrice}
                      onChange={handleCustomPriceChange}
                      type="text"
                      helperText="Leave empty to use default price"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Description (Optional)"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      multiline
                      rows={2}
                      helperText="Leave empty to use default description"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isHighlighted}
                          onChange={(e) => setIsHighlighted(e.target.checked)}
                        />
                      }
                      label="Highlight this add-on (recommended)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddAddon}
                        disabled={selectedProduct === ""}
                      >
                        Add Add-on
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {config.addon_items.length > 0 ? (
                <List>
                  {config.addon_items.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <>
                            {getProductName(item.product)}
                            {item.is_highlighted && (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{ ml: 1, color: "success.main" }}
                              >
                                (Highlighted)
                              </Typography>
                            )}
                          </>
                        }
                        secondary={
                          <>
                            Price: $
                            {item.custom_price !== undefined
                              ? item.custom_price
                              : getProductPrice(item.product)}
                            {item.custom_description && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Custom description: {item.custom_description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAddon(index)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  No add-ons added yet. Add add-ons to give clients more
                  options.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_required}
                    onChange={handleChange}
                    name="is_required"
                  />
                }
                label="Step is required"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_visible}
                    onChange={handleChange}
                    name="is_visible"
                  />
                }
                label="Step is visible"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddonConfigForm;
