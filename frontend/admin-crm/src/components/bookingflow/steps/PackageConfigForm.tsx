// frontend/admin-crm/src/components/bookingflow/steps/PackageConfigForm.tsx
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
import { PackageConfig, PackageItem } from "../../../types/bookingflow.types";
import { ProductOption } from "../../../types/products.types";

interface PackageConfigFormProps {
  initialConfig?: PackageConfig;
  products: ProductOption[];
  onSave: (config: PackageConfig) => void;
  isLoading?: boolean;
}

const PackageConfigForm: React.FC<PackageConfigFormProps> = ({
  initialConfig,
  products,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: PackageConfig = {
    title: "Select a Package",
    description: "Choose the package that best suits your needs.",
    min_selection: 1,
    max_selection: 1,
    selection_type: "SINGLE",
    package_items: [],
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<PackageConfig>(
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

  // Handle selection type change
  const handleSelectionTypeChange = (e: SelectChangeEvent<string>) => {
    const newType = e.target.value as "SINGLE" | "MULTIPLE";

    // If changing from MULTIPLE to SINGLE, adjust max_selection accordingly
    const newMaxSelection = newType === "SINGLE" ? 1 : config.max_selection;

    setConfig({
      ...config,
      selection_type: newType,
      max_selection: newMaxSelection,
    });
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
  const handleAddPackage = () => {
    if (selectedProduct === "") return;

    // Check if product is already in the list
    const exists = config.package_items.some((item) =>
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

    const nextOrder = config.package_items.length + 1;

    const newItem: PackageItem = {
      product: selectedProduct as number,
      order: nextOrder,
      is_highlighted: isHighlighted,
      custom_price: customPrice ? parseFloat(customPrice) : undefined,
      custom_description: customDescription || undefined,
    };

    setConfig({
      ...config,
      package_items: [...config.package_items, newItem],
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
  const handleRemovePackage = (index: number) => {
    const newItems = [...config.package_items];
    newItems.splice(index, 1);

    // Reorder items
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setConfig({
      ...config,
      package_items: reorderedItems,
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

    if (config.package_items.length === 0) {
      newErrors.package_items = "At least one package is required";
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

    if (config.selection_type === "SINGLE" && config.max_selection > 1) {
      newErrors.max_selection =
        "Max selection must be 1 for single selection type";
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
          Packages Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the packages that clients can select during the booking
          process.
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

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="selection-type-label">
                  Selection Type
                </InputLabel>
                <Select
                  labelId="selection-type-label"
                  value={config.selection_type}
                  label="Selection Type"
                  onChange={handleSelectionTypeChange}
                >
                  <MenuItem value="SINGLE">Single Selection</MenuItem>
                  <MenuItem value="MULTIPLE">Multiple Selection</MenuItem>
                </Select>
                <FormHelperText>
                  {config.selection_type === "SINGLE"
                    ? "Clients can select only one package"
                    : "Clients can select multiple packages"}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Selection"
                name="min_selection"
                type="number"
                value={config.min_selection}
                onChange={handleChange}
                error={!!errors.min_selection}
                helperText={
                  errors.min_selection || "Minimum number of packages to select"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
                    : "Maximum number of packages to select")
                }
                inputProps={{ min: 0 }}
                disabled={config.selection_type === "SINGLE"}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Available Packages
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.selectedProduct}>
                      <InputLabel id="product-select-label">
                        Select Package
                      </InputLabel>
                      <Select
                        labelId="product-select-label"
                        value={selectedProduct}
                        label="Select Package"
                        onChange={handleProductChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select a package
                        </MenuItem>
                        {products
                          .filter(
                            (p) =>
                              p.is_active &&
                              (p.type === "PACKAGE" || p.type === "PRODUCT")
                          )
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
                      label="Highlight this package (recommended)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddPackage}
                        disabled={selectedProduct === ""}
                      >
                        Add Package
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {errors.package_items && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.package_items}
                </Typography>
              )}

              {config.package_items.length > 0 ? (
                <List>
                  {config.package_items.map((item, index) => (
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
                          onClick={() => handleRemovePackage(index)}
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
                  No packages added yet. Add at least one package.
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

export default PackageConfigForm;
