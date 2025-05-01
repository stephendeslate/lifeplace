// frontend/client-portal/src/components/booking/ProductStep.tsx
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { BookingStep } from "../../types/bookingflow.types";

interface ProductStepProps {
  step: BookingStep;
  selectedProducts: Array<{ productId: number; quantity: number }>;
  onAddProduct: (productId: number, quantity: number) => void;
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const ProductStep: React.FC<ProductStepProps> = ({
  step,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!step.product_config) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">
          Product configuration not found for this step.
        </Typography>
      </Box>
    );
  }

  const productConfig = step.product_config;
  const isMultiple = productConfig.selection_type === "MULTIPLE";
  const minSelection = productConfig.min_selection;
  const maxSelection = productConfig.max_selection;

  const isSelected = (productId: number) =>
    selectedProducts.some((p) => p.productId === productId);

  const getQuantity = (productId: number) => {
    const product = selectedProducts.find((p) => p.productId === productId);
    return product ? product.quantity : 0;
  };

  const handleAddProduct = (productId: number) => {
    if (isMultiple || selectedProducts.length === 0) {
      onAddProduct(productId, 1);
    } else {
      // For single selection, replace the current selection
      if (selectedProducts.length > 0) {
        onRemoveProduct(selectedProducts[0].productId);
      }
      onAddProduct(productId, 1);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    onRemoveProduct(productId);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
    } else {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const renderProductItem = (item: any) => {
    const {
      id,
      product,
      product_details,
      is_highlighted,
      custom_price,
      custom_description,
    } = item;
    const productData = product_details || product;
    const productId = typeof product === "number" ? product : product.id;
    const quantity = getQuantity(productId);
    const selected = isSelected(productId);

    const price =
      custom_price !== null ? custom_price : productData?.base_price || 0;
    const description = custom_description || productData?.description || "";

    return (
      <Grid {...({ item: true, xs: 12, sm: 6, md: 4, key: id } as any)}>
        <Card
          sx={{
            height: "100%",
            border: selected ? "2px solid" : "none",
            borderColor: "primary.main",
            position: "relative",
            boxShadow: is_highlighted ? 4 : 1,
          }}
        >
          {is_highlighted && (
            <Chip
              label="Recommended"
              color="primary"
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1,
              }}
            />
          )}

          <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
              {productData?.name || `Product ${productId}`}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>

            <Typography variant="h6" color="primary" gutterBottom>
              ${price.toFixed(2)}
            </Typography>
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            {selected ? (
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(productId, quantity - 1)}
                >
                  <RemoveIcon />
                </IconButton>

                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      productId,
                      parseInt(e.target.value) || 0
                    )
                  }
                  inputProps={{ min: 1, style: { textAlign: "center" } }}
                  sx={{ width: 60, mx: 1 }}
                />

                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(productId, quantity + 1)}
                >
                  <AddIcon />
                </IconButton>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ ml: "auto" }}
                  onClick={() => handleRemoveProduct(productId)}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleAddProduct(productId)}
                disabled={
                  (!isMultiple && selectedProducts.length > 0) ||
                  (maxSelection > 0 && selectedProducts.length >= maxSelection)
                }
              >
                Select
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {step.name}
        </Typography>

        {step.description && (
          <Typography variant="body1" paragraph>
            {step.description}
          </Typography>
        )}

        {minSelection > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select{" "}
            {minSelection === 1
              ? "at least one option"
              : `at least ${minSelection} options`}
          </Typography>
        )}

        {maxSelection > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can select up to {maxSelection}{" "}
            {maxSelection === 1 ? "option" : "options"}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: "error.main" }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {productConfig.product_items.map(renderProductItem)}
          </Grid>
        )}

        {selectedProducts.length > 0 && (
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Selected Items:
            </Typography>
            {selectedProducts.map((p) => {
              const item = productConfig.product_items.find(
                (i) =>
                  (typeof i.product === "number" ? i.product : i.product.id) ===
                  p.productId
              );
              const productName =
                item?.product_details?.name || `Product ${p.productId}`;

              return (
                <Typography key={p.productId} variant="body2">
                  {productName} x {p.quantity}
                </Typography>
              );
            })}
          </Box>
        )}

        {step.instructions && (
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProductStep;
