// frontend/client-portal/src/components/booking/steps/PackageStep.tsx
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
import { PackageConfig, PackageItem } from "../../../types/booking.types";

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

interface PackageStepProps {
  config: PackageConfig;
}

const PackageStep: React.FC<PackageStepProps> = ({ config }) => {
  const {
    state,
    setSelectedPackages,
    addPackage,
    removePackage,
    calculateTotalPrice,
  } = useClientBooking();
  const theme = useTheme();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if selection meets min/max requirements
  useEffect(() => {
    const selectedCount = state.formData.selectedPackages.reduce(
      (total, pkg) => total + pkg.quantity,
      0
    );

    if (selectedCount < config.min_selection) {
      setValidationError(
        `Please select at least ${config.min_selection} package(s)`
      );
    } else if (
      config.max_selection !== 0 &&
      selectedCount > config.max_selection
    ) {
      setValidationError(
        `You can select at most ${config.max_selection} package(s)`
      );
    } else {
      setValidationError(null);
    }
  }, [
    state.formData.selectedPackages,
    config.min_selection,
    config.max_selection,
  ]);

  // When packages change, calculate total price
  useEffect(() => {
    if (config.package_items.length > 0) {
      calculateTotalPrice(
        state.formData.selectedPackages,
        state.formData.selectedAddons,
        config.package_items,
        [] // No addon items here
      );
    }
  }, [
    state.formData.selectedPackages,
    calculateTotalPrice,
    config.package_items,
  ]);

  // Handle package selection
  const handlePackageSelect = (packageId: number) => {
    // For single selection, replace existing selection
    if (config.selection_type === "SINGLE") {
      setSelectedPackages([{ packageId, quantity: 1 }]);
    } else {
      // For multiple selection, check if already selected
      const existing = state.formData.selectedPackages.find(
        (item) => item.packageId === packageId
      );

      if (existing) {
        // If already selected, increment quantity
        addPackage(packageId, existing.quantity + 1);
      } else {
        // If not selected, add with quantity 1
        addPackage(packageId, 1);
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (packageId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removePackage(packageId);
    } else {
      addPackage(packageId, newQuantity);
    }
  };

  // Get package details
  const getPackageDetails = (item: PackageItem) => {
    const productId =
      typeof item.product === "object" ? item.product.id : item.product;
    const name =
      typeof item.product === "object"
        ? item.product.name
        : `Package ${item.product}`;
    const description =
      item.custom_description ||
      (typeof item.product === "object" ? item.product.description : "");
    const price =
      item.custom_price ||
      (typeof item.product === "object" ? item.product.base_price : 0);

    return { id: productId, name, description, price };
  };

  // Check if a package is selected
  const isPackageSelected = (packageId: number) => {
    return state.formData.selectedPackages.some(
      (item) => item.packageId === packageId
    );
  };

  // Get quantity for a package
  const getPackageQuantity = (packageId: number) => {
    const item = state.formData.selectedPackages.find(
      (item) => item.packageId === packageId
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
        {config.package_items.map((packageItem) => {
          const { id, name, description, price } =
            getPackageDetails(packageItem);
          const isSelected = isPackageSelected(id);
          const quantity = getPackageQuantity(id);

          return (
            <Grid
              {...({
                item: true,
                xs: 12,
                sm: 6,
                md: config.selection_type === "SINGLE" ? 4 : 6,
              } as any)}
              key={id}
            >
              <StyledCard
                highlighted={packageItem.is_highlighted}
                selected={isSelected}
              >
                {packageItem.is_highlighted && (
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
                        disabled={
                          config.selection_type === "SINGLE" || quantity <= 1
                        }
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
                          config.selection_type === "SINGLE" ||
                          (config.max_selection !== 0 &&
                            getTotalSelected() >= config.max_selection)
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
                      onClick={() => handlePackageSelect(id)}
                      disabled={
                        config.selection_type === "SINGLE" &&
                        state.formData.selectedPackages.length > 0 &&
                        state.formData.selectedPackages[0].packageId !== id
                      }
                    >
                      Select
                    </Button>
                  )}
                </CardActions>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {config.package_items.length === 0 && (
        <Typography align="center" color="text.secondary">
          No packages available for selection
        </Typography>
      )}
    </Box>
  );

  // Helper function to get total selected items
  function getTotalSelected() {
    return state.formData.selectedPackages.reduce(
      (total, pkg) => total + pkg.quantity,
      0
    );
  }
};

export default PackageStep;
