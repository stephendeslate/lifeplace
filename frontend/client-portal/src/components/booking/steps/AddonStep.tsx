// frontend/client-portal/src/components/booking/steps/AddonStep.tsx
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  styled,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useClientBooking from "../../../hooks/useClientBooking";
import { AddonConfig, AddonItem } from "../../../types/booking.types";

const StyledCard = styled(Card)<{ highlighted?: boolean; selected?: boolean }>(
  ({ theme, highlighted, selected }) => ({
    height: "100%",
    transition: "all 0.3s ease",
    position: "relative",
    border: selected
      ? `2px solid ${theme.palette.primary.main}`
      : highlighted
      ? `2px solid ${theme.palette.secondary.main}`
      : "2px solid transparent",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  })
);

const CardHighlight = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: theme.spacing(0.5, 1),
  borderBottomLeftRadius: theme.shape.borderRadius,
  zIndex: 1,
}));

const QuantityControl = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(2),
}));

interface AddonStepProps {
  config: AddonConfig;
}

const AddonStep: React.FC<AddonStepProps> = ({ config }) => {
  const {
    state,
    setSelectedAddons,
    addAddon,
    removeAddon,
    calculateTotalPrice,
  } = useClientBooking();
  const theme = useTheme();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if selection meets min/max requirements
  useEffect(() => {
    const selectedCount = state.formData.selectedAddons.reduce(
      (total, addon) => total + addon.quantity,
      0
    );

    if (config.is_required && selectedCount < config.min_selection) {
      setValidationError(
        `Please select at least ${config.min_selection} add-on(s)`
      );
    } else if (
      config.max_selection !== 0 &&
      selectedCount > config.max_selection
    ) {
      setValidationError(
        `You can select at most ${config.max_selection} add-on(s)`
      );
    } else {
      setValidationError(null);
    }
  }, [
    state.formData.selectedAddons,
    config.min_selection,
    config.max_selection,
    config.is_required,
  ]);

  // When addons change, calculate total price
  useEffect(() => {
    if (config.addon_items.length > 0) {
      calculateTotalPrice(
        state.formData.selectedPackages,
        state.formData.selectedAddons,
        [], // No package items here
        config.addon_items
      );
    }
  }, [state.formData.selectedAddons, calculateTotalPrice, config.addon_items]);

  // Handle addon selection
  const handleAddonSelect = (addonId: number) => {
    // Check if already selected
    const existing = state.formData.selectedAddons.find(
      (item) => item.addonId === addonId
    );

    if (existing) {
      // If already selected, increment quantity
      addAddon(addonId, existing.quantity + 1);
    } else {
      // If not selected, add with quantity 1
      addAddon(addonId, 1);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (addonId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeAddon(addonId);
    } else {
      addAddon(addonId, newQuantity);
    }
  };

  // Get addon details
  const getAddonDetails = (item: AddonItem) => {
    const productId =
      typeof item.product === "object" ? item.product.id : item.product;
    const name =
      typeof item.product === "object"
        ? item.product.name
        : `Add-on ${item.product}`;
    const description =
      item.custom_description ||
      (typeof item.product === "object" ? item.product.description : "");
    const price =
      item.custom_price ||
      (typeof item.product === "object" ? item.product.base_price : 0);

    return { id: productId, name, description, price };
  };

  // Check if an addon is selected
  const isAddonSelected = (addonId: number) => {
    return state.formData.selectedAddons.some(
      (item) => item.addonId === addonId
    );
  };

  // Get quantity for an addon
  const getAddonQuantity = (addonId: number) => {
    const item = state.formData.selectedAddons.find(
      (item) => item.addonId === addonId
    );
    return item ? item.quantity : 0;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      {validationError && (
        <Typography
          color="error"
          variant="subtitle2"
          align="center"
          sx={{ mb: 2 }}
        >
          {validationError}
        </Typography>
      )}

      <Grid container spacing={3}>
        {config.addon_items.map((addonItem) => {
          const { id, name, description, price } = getAddonDetails(addonItem);
          const isSelected = isAddonSelected(id);
          const quantity = getAddonQuantity(id);

          return (
            <Grid
              {...({
                item: true,
                xs: 12,
                sm: 6,
                md: 4,
              } as any)}
              key={id}
            >
              <StyledCard
                highlighted={addonItem.is_highlighted}
                selected={isSelected}
              >
                {addonItem.is_highlighted && (
                  <CardHighlight>Recommended</CardHighlight>
                )}

                <CardHeader
                  title={name}
                  subheader={`$${price.toFixed(2)}`}
                  titleTypography={{ variant: "h6" }}
                  subheaderTypography={{
                    variant: "subtitle1",
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                  }}
                />

                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </CardContent>

                <CardActions>
                  {isSelected ? (
                    <QuantityControl>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuantityChange(id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </Button>

                      <TextField
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            handleQuantityChange(id, val);
                          }
                        }}
                        inputProps={{
                          min: 1,
                          style: { textAlign: "center" },
                          "aria-label": "quantity",
                        }}
                        sx={{ width: 60, mx: 1 }}
                      />

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuantityChange(id, quantity + 1)}
                        disabled={
                          config.max_selection !== 0 &&
                          getTotalSelected() >= config.max_selection
                        }
                      >
                        <AddIcon fontSize="small" />
                      </Button>
                    </QuantityControl>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddonSelect(id)}
                      disabled={
                        config.max_selection !== 0 &&
                        getTotalSelected() >= config.max_selection
                      }
                    >
                      Add
                    </Button>
                  )}
                </CardActions>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {config.addon_items.length === 0 && (
        <Typography align="center" color="text.secondary">
          No add-ons available for selection
        </Typography>
      )}

      {!config.is_required &&
        config.addon_items.length > 0 &&
        state.formData.selectedAddons.length === 0 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Add-ons are optional. You can continue without selecting any.
            </Typography>
          </Box>
        )}
    </Box>
  );

  // Helper function to get total selected items
  function getTotalSelected() {
    return state.formData.selectedAddons.reduce(
      (total, addon) => total + addon.quantity,
      0
    );
  }
};

export default AddonStep;
