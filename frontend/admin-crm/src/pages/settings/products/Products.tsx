// frontend/admin-crm/src/pages/settings/products/Products.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  LocalOffer as DiscountIcon,
  Inventory2 as PackageIcon,
  ShoppingCart as ProductIcon,
  Search as SearchIcon,
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
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, formatDistanceToNow, isAfter, isValid } from "date-fns";
import React, { useEffect, useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useProducts } from "../../../hooks/useProducts";
import { useDiscounts } from "../../../hooks/useDiscounts";
import {
  Discount,
  DiscountFormData,
  DiscountFormErrors,
  DiscountType,
  ProductOption,
  ProductOptionFormData,
  ProductOptionFormErrors,
  ProductType,
} from "../../../types/products.types";

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`products-tabpanel-${index}`}
      aria-labelledby={`products-tab-${index}`}
      style={{ paddingTop: "16px" }}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const Products = () => {
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<ProductType | "">(
    ""
  );
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // State for dialogs
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [deleteDiscountDialogOpen, setDeleteDiscountDialogOpen] =
    useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);

  // Form state for product
  const initialProductForm: ProductOptionFormData = {
    name: "",
    description: "",
    base_price: 0,
    currency: "PHP",
    tax_rate: 0,
    event_type: null,
    type: "PRODUCT",
    is_active: true,
    allow_multiple: false,
    has_excess_hours: false,
  };
  const [productForm, setProductForm] =
    useState<ProductOptionFormData>(initialProductForm);
  const [productFormErrors, setProductFormErrors] =
    useState<ProductOptionFormErrors>({});

  // Form state for discount
  const initialDiscountForm: DiscountFormData = {
    code: "",
    description: "",
    discount_type: "PERCENTAGE",
    value: 0,
    is_active: true,
    valid_from: format(new Date(), "yyyy-MM-dd"),
    applicable_products: [],
  };
  const [discountForm, setDiscountForm] =
    useState<DiscountFormData>(initialDiscountForm);
  const [discountFormErrors, setDiscountFormErrors] =
    useState<DiscountFormErrors>({});

  // Use our custom hooks for data fetching and mutations
  const {
    products,
    totalCount: totalProducts,
    isLoading: isLoadingProducts,
    packages,
    productItems,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
  } = useProducts(
    page + 1,
    (productTypeFilter as ProductType) || undefined,
    searchTerm
  );

  const {
    discounts,
    totalCount: totalDiscounts,
    isLoading: isLoadingDiscounts,
    createDiscount,
    isCreating: isCreatingDiscount,
    updateDiscount,
    isUpdating: isUpdatingDiscount,
    deleteDiscount,
    isDeleting: isDeletingDiscount,
  } = useDiscounts(page + 1, searchTerm);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm("");
    setProductTypeFilter("");
    setShowActiveOnly(false);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle product form change
  const handleProductFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setProductForm({
      ...productForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (productFormErrors[name as keyof ProductOptionFormErrors]) {
      setProductFormErrors({
        ...productFormErrors,
        [name]: undefined,
      });
    }
  };

  // Handle product type change
  const handleProductTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductForm({
      ...productForm,
      type: e.target.value as ProductType,
    });
  };

  // Handle has excess hours change
  const handleExcessHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasExcessHours = e.target.checked;

    setProductForm({
      ...productForm,
      has_excess_hours: hasExcessHours,
      // Reset related fields if turning off
      ...(hasExcessHours
        ? {}
        : { included_hours: null, excess_hour_price: null }),
    });
  };

  // Validate product form
  const validateProductForm = (): boolean => {
    const errors: ProductOptionFormErrors = {};
    let isValid = true;

    if (!productForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!productForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (productForm.base_price <= 0) {
      errors.base_price = "Base price must be greater than 0";
      isValid = false;
    }

    if (productForm.tax_rate < 0) {
      errors.tax_rate = "Tax rate cannot be negative";
      isValid = false;
    }

    if (productForm.has_excess_hours) {
      if (!productForm.included_hours || productForm.included_hours <= 0) {
        errors.included_hours = "Included hours must be greater than 0";
        isValid = false;
      }

      if (
        !productForm.excess_hour_price ||
        productForm.excess_hour_price <= 0
      ) {
        errors.excess_hour_price = "Excess hour price must be greater than 0";
        isValid = false;
      }
    }

    setProductFormErrors(errors);
    return isValid;
  };

  // Handle save product
  const handleSaveProduct = () => {
    if (validateProductForm()) {
      if (editMode && selectedProductId) {
        updateProduct({ id: selectedProductId, productData: productForm });
      } else {
        createProduct(productForm);
      }
      setProductDialogOpen(false);
      resetProductForm();
    }
  };

  // Handle edit product
  const handleEditProduct = (product: ProductOption) => {
    setProductForm({
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      currency: product.currency,
      tax_rate: product.tax_rate,
      event_type: product.event_type,
      type: product.type,
      is_active: product.is_active,
      allow_multiple: product.allow_multiple,
      has_excess_hours: product.has_excess_hours,
      included_hours: product.included_hours,
      excess_hour_price: product.excess_hour_price,
    });
    setSelectedProductId(product.id);
    setEditMode(true);
    setProductDialogOpen(true);
  };

  // Handle delete product click
  const handleDeleteProductClick = (id: number) => {
    setSelectedProductId(id);
    setDeleteProductDialogOpen(true);
  };

  // Handle confirm delete product
  const handleConfirmDeleteProduct = () => {
    if (selectedProductId) {
      deleteProduct(selectedProductId);
      setDeleteProductDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setProductFormErrors({});
    setEditMode(false);
    setSelectedProductId(null);
  };

  // Handle discount form change
  const handleDiscountFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setDiscountForm({
      ...discountForm,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (discountFormErrors[name as keyof DiscountFormErrors]) {
      setDiscountFormErrors({
        ...discountFormErrors,
        [name]: undefined,
      });
    }
  };

  // Handle discount type change
  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountForm({
      ...discountForm,
      discount_type: e.target.value as DiscountType,
    });
  };

  // Handle date change for discount validity
  const handleDateChange = (
    date: Date | null,
    field: "valid_from" | "valid_until"
  ) => {
    if (date && isValid(date)) {
      setDiscountForm({
        ...discountForm,
        [field]: format(date, "yyyy-MM-dd"),
      });

      // Clear date-related errors
      if (discountFormErrors[field]) {
        setDiscountFormErrors({
          ...discountFormErrors,
          [field]: undefined,
        });
      }
    }
  };

  // Handle product selection for discount
  const handleProductSelection = (productId: number) => {
    const currentProducts = [...discountForm.applicable_products];

    if (currentProducts.includes(productId)) {
      // Remove product
      setDiscountForm({
        ...discountForm,
        applicable_products: currentProducts.filter((id) => id !== productId),
      });
    } else {
      // Add product
      setDiscountForm({
        ...discountForm,
        applicable_products: [...currentProducts, productId],
      });
    }
  };

  // Validate discount form
  const validateDiscountForm = (): boolean => {
    const errors: DiscountFormErrors = {};
    let isValid = true;

    if (!discountForm.code.trim()) {
      errors.code = "Discount code is required";
      isValid = false;
    }

    if (!discountForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (discountForm.discount_type === "PERCENTAGE") {
      if (discountForm.value <= 0 || discountForm.value > 100) {
        errors.value = "Percentage must be between 0 and 100";
        isValid = false;
      }
    } else {
      if (discountForm.value <= 0) {
        errors.value = "Amount must be greater than 0";
        isValid = false;
      }
    }

    if (!discountForm.valid_from) {
      errors.valid_from = "Start date is required";
      isValid = false;
    }

    if (discountForm.valid_from && discountForm.valid_until) {
      const fromDate = new Date(discountForm.valid_from);
      const untilDate = new Date(discountForm.valid_until);

      if (isAfter(fromDate, untilDate)) {
        errors.valid_until = "End date must be after start date";
        isValid = false;
      }
    }

    setDiscountFormErrors(errors);
    return isValid;
  };

  // Handle save discount
  const handleSaveDiscount = () => {
    if (validateDiscountForm()) {
      if (editMode && selectedDiscountId) {
        updateDiscount({ id: selectedDiscountId, discountData: discountForm });
      } else {
        createDiscount(discountForm);
      }
      setDiscountDialogOpen(false);
      resetDiscountForm();
    }
  };

  // Handle edit discount
  const handleEditDiscount = (discount: Discount) => {
    setDiscountForm({
      code: discount.code,
      description: discount.description,
      discount_type: discount.discount_type,
      value: discount.value,
      is_active: discount.is_active,
      valid_from: discount.valid_from,
      valid_until: discount.valid_until || undefined,
      max_uses: discount.max_uses || undefined,
      applicable_products:
        Array.isArray(discount.applicable_products) &&
        typeof discount.applicable_products[0] === "number"
          ? (discount.applicable_products as number[])
          : (discount.applicable_products as ProductOption[]).map((p) => p.id),
    });
    setSelectedDiscountId(discount.id);
    setEditMode(true);
    setDiscountDialogOpen(true);
  };

  // Handle delete discount click
  const handleDeleteDiscountClick = (id: number) => {
    setSelectedDiscountId(id);
    setDeleteDiscountDialogOpen(true);
  };

  // Handle confirm delete discount
  const handleConfirmDeleteDiscount = () => {
    if (selectedDiscountId) {
      deleteDiscount(selectedDiscountId);
      setDeleteDiscountDialogOpen(false);
      setSelectedDiscountId(null);
    }
  };

  // Reset discount form
  const resetDiscountForm = () => {
    setDiscountForm(initialDiscountForm);
    setDiscountFormErrors({});
    setEditMode(false);
    setSelectedDiscountId(null);
  };

  return (
    <SettingsLayout
      title="Products and Discounts"
      description="Manage your products, packages, and discount offerings"
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="products and discounts tabs"
        >
          <Tab
            label="Products & Packages"
            id="products-tab-0"
            aria-controls="products-tabpanel-0"
          />
          <Tab
            label="Discounts"
            id="products-tab-1"
            aria-controls="products-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Products Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={productTypeFilter}
                onChange={(e) =>
                  setProductTypeFilter(e.target.value as ProductType | "")
                }
                displayEmpty
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="PACKAGE">Packages</MenuItem>
                <MenuItem value="PRODUCT">Products</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                />
              }
              label="Active only"
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetProductForm();
              setProductDialogOpen(true);
            }}
          >
            Add Product
          </Button>
        </Box>

        {isLoadingProducts ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Packages Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Packages
              </Typography>

              {packages.filter((p) => !showActiveOnly || p.is_active).length ===
              0 ? (
                <Alert severity="info">No packages found</Alert>
              ) : (
                <Grid container spacing={3}>
                  {packages
                    .filter((p) => !showActiveOnly || p.is_active)
                    .map((pkg) => (
                      <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            opacity: pkg.is_active ? 1 : 0.7,
                            position: "relative",
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PackageIcon color="primary" />
                                <Typography variant="h6" component="div">
                                  {pkg.name}
                                </Typography>
                              </Box>
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditProduct(pkg)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleDeleteProductClick(pkg.id)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {pkg.description}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Price:
                              </Typography>
                              <Typography variant="body2">
                                {pkg.currency}{" "}
                                {pkg.base_price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Tax Rate:
                              </Typography>
                              <Typography variant="body2">
                                {pkg.tax_rate}%
                              </Typography>
                            </Stack>

                            {pkg.has_excess_hours && (
                              <>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    Included Hours:
                                  </Typography>
                                  <Typography variant="body2">
                                    {pkg.included_hours}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    Excess Hour Rate:
                                  </Typography>
                                  <Typography variant="body2">
                                    {pkg.currency}{" "}
                                    {pkg.excess_hour_price?.toLocaleString(
                                      undefined,
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </Typography>
                                </Stack>
                              </>
                            )}

                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                              {!pkg.is_active && (
                                <Chip
                                  label="Inactive"
                                  size="small"
                                  color="default"
                                />
                              )}
                              {pkg.allow_multiple && (
                                <Chip
                                  label="Multiple Allowed"
                                  size="small"
                                  color="info"
                                />
                              )}
                              {pkg.has_excess_hours && (
                                <Chip
                                  label="Excess Hours"
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Products Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Products
              </Typography>

              {productItems.filter((p) => !showActiveOnly || p.is_active)
                .length === 0 ? (
                <Alert severity="info">No products found</Alert>
              ) : (
                <Grid container spacing={3}>
                  {productItems
                    .filter((p) => !showActiveOnly || p.is_active)
                    .map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            opacity: product.is_active ? 1 : 0.7,
                            position: "relative",
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <ProductIcon color="primary" />
                                <Typography variant="h6" component="div">
                                  {product.name}
                                </Typography>
                              </Box>
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleDeleteProductClick(product.id)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {product.description}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Price:
                              </Typography>
                              <Typography variant="body2">
                                {product.currency}{" "}
                                {product.base_price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Tax Rate:
                              </Typography>
                              <Typography variant="body2">
                                {product.tax_rate}%
                              </Typography>
                            </Stack>

                            {product.has_excess_hours && (
                              <>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    Included Hours:
                                  </Typography>
                                  <Typography variant="body2">
                                    {product.included_hours}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    Excess Hour Rate:
                                  </Typography>
                                  <Typography variant="body2">
                                    {product.currency}{" "}
                                    {product.excess_hour_price?.toLocaleString(
                                      undefined,
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </Typography>
                                </Stack>
                              </>
                            )}

                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                              {!product.is_active && (
                                <Chip
                                  label="Inactive"
                                  size="small"
                                  color="default"
                                />
                              )}
                              {product.allow_multiple && (
                                <Chip
                                  label="Multiple Allowed"
                                  size="small"
                                  color="info"
                                />
                              )}
                              {product.has_excess_hours && (
                                <Chip
                                  label="Excess Hours"
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
          </>
        )}
      </TabPanel>

      {/* Discounts Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search discounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetDiscountForm();
              setDiscountDialogOpen(true);
            }}
          >
            Add Discount
          </Button>
        </Box>

        {isLoadingDiscounts ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : discounts.length === 0 ? (
          <Alert severity="info">No discounts found</Alert>
        ) : (
          <Grid container spacing={3}>
            {discounts.map((discount) => (
              <Grid item xs={12} sm={6} md={4} key={discount.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    opacity:
                      discount.is_active && discount.is_valid_now ? 1 : 0.7,
                    position: "relative",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <DiscountIcon color="primary" />
                        <Typography variant="h6" component="div">
                          {discount.code}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteDiscountClick(discount.id)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {discount.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Type:
                      </Typography>
                      <Typography variant="body2">
                        {discount.discount_type_display}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Value:
                      </Typography>
                      <Typography variant="body2">
                        {discount.discount_type === "PERCENTAGE"
                          ? `${discount.value}%`
                          : `PHP ${discount.value.toLocaleString()}`}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Valid Period:
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(discount.valid_from), "MMM d, yyyy")}
                        {discount.valid_until &&
                          ` - ${format(
                            new Date(discount.valid_until),
                            "MMM d, yyyy"
                          )}`}
                      </Typography>
                    </Stack>

                    {discount.max_uses && (
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Usage:
                        </Typography>
                        <Typography variant="body2">
                          {discount.current_uses} / {discount.max_uses}
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Applicable Products:
                      </Typography>
                      <Typography variant="body2">
                        {discount.applicable_products_count === 0
                          ? "All products"
                          : `${discount.applicable_products_count} products`}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      {!discount.is_active && (
                        <Chip label="Inactive" size="small" color="default" />
                      )}
                      {discount.is_valid_now ? (
                        <Chip
                          label="Currently Valid"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip label="Not Valid" size="small" color="error" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Product Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Type</FormLabel>
                <RadioGroup
                  row
                  name="type"
                  value={productForm.type}
                  onChange={handleProductTypeChange}
                >
                  <FormControlLabel
                    value="PRODUCT"
                    control={<Radio />}
                    label="Product"
                  />
                  <FormControlLabel
                    value="PACKAGE"
                    control={<Radio />}
                    label="Package"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                error={!!productFormErrors.name}
                helperText={productFormErrors.name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={productForm.is_active}
                    onChange={handleProductFormChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                multiline
                rows={3}
                error={!!productFormErrors.description}
                helperText={productFormErrors.description}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Base Price"
                name="base_price"
                type="number"
                value={productForm.base_price}
                onChange={handleProductFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {productForm.currency}
                    </InputAdornment>
                  ),
                }}
                error={!!productFormErrors.base_price}
                helperText={productFormErrors.base_price}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Currency"
                name="currency"
                value={productForm.currency}
                onChange={handleProductFormChange}
                select
              >
                <MenuItem value="PHP">PHP</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                name="tax_rate"
                type="number"
                value={productForm.tax_rate}
                onChange={handleProductFormChange}
                error={!!productFormErrors.tax_rate}
                helperText={productFormErrors.tax_rate}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="allow_multiple"
                    checked={productForm.allow_multiple}
                    onChange={handleProductFormChange}
                    color="primary"
                  />
                }
                label="Allow Multiple"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="has_excess_hours"
                    checked={productForm.has_excess_hours}
                    onChange={handleExcessHoursChange}
                    color="primary"
                  />
                }
                label="Has Excess Hours"
              />
            </Grid>

            {productForm.has_excess_hours && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Included Hours"
                    name="included_hours"
                    type="number"
                    value={productForm.included_hours || ""}
                    onChange={handleProductFormChange}
                    error={!!productFormErrors.included_hours}
                    helperText={productFormErrors.included_hours}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Excess Hour Price"
                    name="excess_hour_price"
                    type="number"
                    value={productForm.excess_hour_price || ""}
                    onChange={handleProductFormChange}
                    error={!!productFormErrors.excess_hour_price}
                    helperText={productFormErrors.excess_hour_price}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {productForm.currency}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            color="primary"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={discountDialogOpen}
          onClose={() => setDiscountDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editMode ? "Edit Discount" : "Add New Discount"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code"
                  name="code"
                  value={discountForm.code}
                  onChange={handleDiscountFormChange}
                  error={!!discountFormErrors.code}
                  helperText={discountFormErrors.code}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={discountForm.is_active}
                      onChange={handleDiscountFormChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={discountForm.description}
                  onChange={handleDiscountFormChange}
                  error={!!discountFormErrors.description}
                  helperText={discountFormErrors.description}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Discount Type</FormLabel>
                  <RadioGroup
                    row
                    name="discount_type"
                    value={discountForm.discount_type}
                    onChange={handleDiscountTypeChange}
                  >
                    <FormControlLabel
                      value="PERCENTAGE"
                      control={<Radio />}
                      label="Percentage"
                    />
                    <FormControlLabel
                      value="FIXED"
                      control={<Radio />}
                      label="Fixed Amount"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    discountForm.discount_type === "PERCENTAGE"
                      ? "Percentage (%)"
                      : "Amount"
                  }
                  name="value"
                  type="number"
                  value={discountForm.value}
                  onChange={handleDiscountFormChange}
                  error={!!discountFormErrors.value}
                  helperText={discountFormErrors.value}
                  required
                  InputProps={
                    discountForm.discount_type === "FIXED"
                      ? {
                          startAdornment: (
                            <InputAdornment position="start">
                              PHP
                            </InputAdornment>
                          ),
                        }
                      : undefined
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Uses"
                  name="max_uses"
                  type="number"
                  value={discountForm.max_uses || ""}
                  onChange={handleDiscountFormChange}
                  error={!!discountFormErrors.max_uses}
                  helperText={
                    discountFormErrors.max_uses ||
                    "Leave empty for unlimited uses"
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Valid From"
                  value={
                    discountForm.valid_from
                      ? new Date(discountForm.valid_from)
                      : null
                  }
                  onChange={(date) => handleDateChange(date, "valid_from")}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!discountFormErrors.valid_from,
                      helperText: discountFormErrors.valid_from,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Valid Until"
                  value={
                    discountForm.valid_until
                      ? new Date(discountForm.valid_until)
                      : null
                  }
                  onChange={(date) => handleDateChange(date, "valid_until")}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!discountFormErrors.valid_until,
                      helperText:
                        discountFormErrors.valid_until ||
                        "Leave empty for no expiration",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={!!discountFormErrors.applicable_products}
                >
                  <FormLabel component="legend">Applicable Products</FormLabel>
                  <FormHelperText>
                    {discountFormErrors.applicable_products ||
                      "Leave empty to apply to all products"}
                  </FormHelperText>

                  {isLoadingProducts ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", my: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Grid container spacing={1}>
                        {products.map((product) => (
                          <Grid item xs={12} sm={6} key={product.id}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={discountForm.applicable_products.includes(
                                    product.id
                                  )}
                                  onChange={() =>
                                    handleProductSelection(product.id)
                                  }
                                  color="primary"
                                />
                              }
                              label={`${product.name} (${product.type_display})`}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveDiscount}
              variant="contained"
              color="primary"
              disabled={isCreatingDiscount || isUpdatingDiscount}
            >
              {isCreatingDiscount || isUpdatingDiscount ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Delete Product Confirmation Dialog */}
      <Dialog
        open={deleteProductDialogOpen}
        onClose={() => setDeleteProductDialogOpen(false)}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProductDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteProduct}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={16} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Discount Confirmation Dialog */}
      <Dialog
        open={deleteDiscountDialogOpen}
        onClose={() => setDeleteDiscountDialogOpen(false)}
      >
        <DialogTitle>Delete Discount</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this discount? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDiscountDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteDiscount}
            variant="contained"
            color="error"
            disabled={isDeletingDiscount}
            startIcon={isDeletingDiscount && <CircularProgress size={16} />}
          >
            {isDeletingDiscount ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default Products;
