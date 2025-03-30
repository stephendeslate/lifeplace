// frontend/admin-crm/src/components/bookingflow/ProductStepItems.tsx
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Star as HighlightIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useProductItems } from "../../hooks/useBookingFlows";
import {
  ProductStepItem,
  ProductStepItemFormData,
  ProductStepItemFormErrors,
} from "../../types/bookingflow.types";
import { ProductOption } from "../../types/products.types";

interface ProductStepItemsProps {
  configId: number;
  products: ProductOption[];
  onAddItem: (configId: number, itemData: ProductStepItemFormData) => void;
  onUpdateItem: (
    id: number,
    itemData: Partial<ProductStepItemFormData>,
    configId: number
  ) => void;
  onDeleteItem: (id: number, configId: number) => void;
  onReorderItems: (data: {
    config_id: number;
    order_mapping: { [key: string]: number };
  }) => void;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isDeletingItem: boolean;
  isReorderingItems: boolean;
}

export const ProductStepItems: React.FC<ProductStepItemsProps> = ({
  configId,
  products,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
  isAddingItem,
  isUpdatingItem,
  isDeletingItem,
  isReorderingItems,
}) => {
  const queryClient = useQueryClient();
  const { items = [], isLoading } = useProductItems(configId);

  // State for item form
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);

  const initialItemForm: ProductStepItemFormData = {
    product: 0,
    is_highlighted: false,
    custom_price: null,
    custom_description: "",
  };
  const [itemForm, setItemForm] =
    useState<ProductStepItemFormData>(initialItemForm);
  const [itemFormErrors, setItemFormErrors] =
    useState<ProductStepItemFormErrors>({});

  // Handle drag end for reordering items
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !configId) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    if (!items) return;

    // Create a copy of the items for reordering
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, movedItem);

    // Create the order mapping based on the new positions
    const orderMapping: { [key: string]: number } = {};
    newItems.forEach((item, index) => {
      orderMapping[item.id.toString()] = index + 1;
    });

    // Call the reorderItems function
    onReorderItems({
      config_id: configId,
      order_mapping: orderMapping,
    });
  };

  // Handle item form change
  const handleItemFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name === "product") {
      setItemForm({
        ...itemForm,
        product: parseInt(value, 10),
      });
    } else if (name === "custom_price") {
      setItemForm({
        ...itemForm,
        custom_price: value === "" ? null : parseFloat(value),
      });
    } else {
      setItemForm({
        ...itemForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error when typing
    if (itemFormErrors[name as keyof ProductStepItemFormErrors]) {
      setItemFormErrors({
        ...itemFormErrors,
        [name]: undefined,
      });
    }
  };

  // Validate item form
  const validateItemForm = (): boolean => {
    const errors: ProductStepItemFormErrors = {};
    let isValid = true;

    if (!itemForm.product) {
      errors.product = "Product is required";
      isValid = false;
    }

    setItemFormErrors(errors);
    return isValid;
  };

  // Handle add/edit item
  const handleSaveItem = () => {
    if (validateItemForm()) {
      if (editMode && selectedItemId) {
        onUpdateItem(selectedItemId, itemForm, configId);
      } else {
        onAddItem(configId, itemForm);
      }
      setItemDialogOpen(false);
      resetItemForm();
    }
  };

  // Handle edit item
  const handleEditItem = (item: ProductStepItem) => {
    setItemForm({
      product:
        typeof item.product === "number" ? item.product : item.product.id,
      is_highlighted: item.is_highlighted,
      custom_price: item.custom_price,
      custom_description: item.custom_description,
    });
    setSelectedItemId(item.id);
    setEditMode(true);
    setItemDialogOpen(true);
  };

  // Reset item form
  const resetItemForm = () => {
    setItemForm(initialItemForm);
    setItemFormErrors({});
    setEditMode(false);
    setSelectedItemId(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Find product details for each item
  const getProductNameById = (productId: number): string => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            resetItemForm();
            setItemDialogOpen(true);
          }}
        >
          Add Product
        </Button>
      </Box>

      {items && items.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No products added yet. Click "Add Product" to add one.
        </Typography>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`product-items-${configId}`}>
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ mb: 4 }}
              >
                {items.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 2,
                          position: "relative",
                          borderLeft: "4px solid",
                          borderLeftColor: item.is_highlighted
                            ? "warning.main"
                            : "primary.main",
                          boxShadow: 1,
                          transition:
                            "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                          "&:hover": {
                            boxShadow: 3,
                          },
                        }}
                      >
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "grab",
                            color: "text.secondary",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          <DragIcon />
                        </Box>

                        <CardContent sx={{ pl: 5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" component="div">
                                {typeof item.product === "object"
                                  ? item.product.name
                                  : getProductNameById(item.product)}
                                <Chip
                                  size="small"
                                  label={`Order ${item.order}`}
                                  sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                                />
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.custom_description ||
                                  (typeof item.product === "object"
                                    ? item.product.description
                                    : "")}
                              </Typography>
                            </Box>

                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleEditItem(item)}
                                disabled={isReorderingItems}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => onDeleteItem(item.id, configId)}
                                disabled={isReorderingItems || isDeletingItem}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {item.custom_price !== null && (
                              <Chip
                                size="small"
                                icon={<PriceIcon fontSize="small" />}
                                label={`Custom Price: $${item.custom_price.toFixed(
                                  2
                                )}`}
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            )}

                            {item.is_highlighted && (
                              <Chip
                                size="small"
                                icon={<HighlightIcon fontSize="small" />}
                                label="Highlighted"
                                color="warning"
                                sx={{ mr: 1 }}
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Product Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)}>
        <DialogTitle>
          {editMode ? "Edit Product Item" : "Add Product Item"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, pt: 1 }}>
            <TextField
              select
              fullWidth
              margin="normal"
              id="product"
              name="product"
              label="Product"
              value={itemForm.product || ""}
              onChange={handleItemFormChange}
              error={!!itemFormErrors.product}
              helperText={itemFormErrors.product}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              margin="normal"
              id="custom_price"
              name="custom_price"
              label="Custom Price (optional)"
              type="number"
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              value={
                itemForm.custom_price === null ? "" : itemForm.custom_price
              }
              onChange={handleItemFormChange}
              error={!!itemFormErrors.custom_price}
              helperText={itemFormErrors.custom_price}
            />

            <TextField
              fullWidth
              margin="normal"
              id="custom_description"
              name="custom_description"
              label="Custom Description (optional)"
              multiline
              rows={3}
              value={itemForm.custom_description}
              onChange={handleItemFormChange}
              error={!!itemFormErrors.custom_description}
              helperText={itemFormErrors.custom_description}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={itemForm.is_highlighted}
                  onChange={handleItemFormChange}
                  name="is_highlighted"
                />
              }
              label="Highlight this product"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            disabled={isAddingItem || isUpdatingItem}
            startIcon={
              (isAddingItem || isUpdatingItem) && <CircularProgress size={20} />
            }
          >
            {isAddingItem || isUpdatingItem ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
