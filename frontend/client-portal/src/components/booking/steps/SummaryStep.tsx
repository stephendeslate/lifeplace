// frontend/client-portal/src/components/booking/steps/SummaryStep.tsx
import {
  Box,
  Divider,
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect } from "react";
import useClientBooking from "../../../hooks/useClientBooking";
import { BookingFlow, SummaryConfig } from "../../../types/booking.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const TotalRow = styled(TableRow)(({ theme }) => ({
  "& .MuiTableCell-root": {
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
}));

interface SummaryStepProps {
  bookingFlow: BookingFlow;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ bookingFlow }) => {
  const { state, calculateTotalPrice } = useClientBooking();
  const config = bookingFlow.summary_config as SummaryConfig;

  // Recalculate total price when component mounts
  useEffect(() => {
    // Calculate total price from packages and add-ons
    if (
      bookingFlow.package_config?.package_items.length ||
      bookingFlow.addon_config?.addon_items.length
    ) {
      calculateTotalPrice(
        state.formData.selectedPackages,
        state.formData.selectedAddons,
        bookingFlow.package_config?.package_items || [],
        bookingFlow.addon_config?.addon_items || []
      );
    }
  }, [
    state.formData.selectedPackages,
    state.formData.selectedAddons,
    bookingFlow.package_config?.package_items,
    bookingFlow.addon_config?.addon_items,
    calculateTotalPrice,
  ]);

  // Helper function to get package/addon details
  const getItemDetails = (id: number, items: any[]) => {
    const item = items.find(
      (item) =>
        (typeof item.product === "number" ? item.product : item.product.id) ===
        id
    );

    if (!item) return { name: `Item ${id}`, price: 0 };

    const name =
      typeof item.product === "object" ? item.product.name : `Item ${id}`;
    const price =
      item.custom_price ||
      (typeof item.product === "object" ? item.product.base_price : 0);

    return { name, price };
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Not specified";
    return format(date, "MMMM d, yyyy");
  };

  // Format time for display
  const formatTime = (time: string | null) => {
    if (!time) return "";

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return format(date, "h:mm a");
    } catch (e) {
      return time;
    }
  };

  // Helper to get total cost for a line item
  const getLineItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      <StyledPaper>
        {/* Event Details */}
        <Typography variant="h6" gutterBottom>
          Event Details
        </Typography>
        <Typography variant="body1">
          {state.formData.eventName ||
            `${bookingFlow.event_type_details?.name} Booking`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Event Type: {bookingFlow.event_type_details?.name}
        </Typography>

        {/* Date and Time */}
        {config.show_date && state.formData.startDate && (
          <>
            <SectionTitle variant="subtitle1">Date & Time</SectionTitle>
            <Grid container spacing={2}>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <Typography variant="body2" color="text.secondary">
                  Date:
                </Typography>
                <Typography variant="body1">
                  {formatDate(state.formData.startDate)}
                </Typography>
              </Grid>
              {state.formData.startTime && (
                <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                  <Typography variant="body2" color="text.secondary">
                    Time:
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(state.formData.startTime)}
                  </Typography>
                </Grid>
              )}
              {state.formData.endDate && (
                <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                  <Typography variant="body2" color="text.secondary">
                    End Date:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(state.formData.endDate)}
                  </Typography>
                </Grid>
              )}
              {state.formData.endTime && (
                <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                  <Typography variant="body2" color="text.secondary">
                    End Time:
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(state.formData.endTime)}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Selected Packages */}
        {config.show_packages && state.formData.selectedPackages.length > 0 && (
          <>
            <SectionTitle variant="subtitle1">Selected Packages</SectionTitle>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Package</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.formData.selectedPackages.map((pkg) => {
                    const { name, price } = getItemDetails(
                      pkg.packageId,
                      bookingFlow.package_config?.package_items || []
                    );
                    const total = getLineItemTotal(price, pkg.quantity);

                    return (
                      <TableRow key={pkg.packageId}>
                        <TableCell>{name}</TableCell>
                        <TableCell align="right">{pkg.quantity}</TableCell>
                        <TableCell align="right">${price.toFixed(2)}</TableCell>
                        <TableCell align="right">${total.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Selected Add-ons */}
        {config.show_addons && state.formData.selectedAddons.length > 0 && (
          <>
            <SectionTitle variant="subtitle1">Selected Add-ons</SectionTitle>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Add-on</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.formData.selectedAddons.map((addon) => {
                    const { name, price } = getItemDetails(
                      addon.addonId,
                      bookingFlow.addon_config?.addon_items || []
                    );
                    const total = getLineItemTotal(price, addon.quantity);

                    return (
                      <TableRow key={addon.addonId}>
                        <TableCell>{name}</TableCell>
                        <TableCell align="right">{addon.quantity}</TableCell>
                        <TableCell align="right">${price.toFixed(2)}</TableCell>
                        <TableCell align="right">${total.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Questionnaire Responses */}
        {config.show_questionnaire &&
          state.formData.questionnaireResponses.length > 0 && (
            <>
              <SectionTitle variant="subtitle1">
                Questionnaire Responses
              </SectionTitle>
              <Box sx={{ mb: 2 }}>
                {bookingFlow.questionnaire_config?.questionnaire_items.map(
                  (item) => {
                    const questionnaire =
                      typeof item.questionnaire === "object"
                        ? item.questionnaire
                        : item.questionnaire_details;

                    if (!questionnaire || !questionnaire.fields) return null;

                    return (
                      <Box
                        key={
                          typeof item.questionnaire === "object"
                            ? item.questionnaire.id
                            : item.questionnaire
                        }
                      >
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          {typeof questionnaire === "object"
                            ? questionnaire.name
                            : `Questionnaire ${questionnaire}`}
                        </Typography>

                        {questionnaire.fields.map((field) => {
                          const response =
                            state.formData.questionnaireResponses.find(
                              (r) => r.fieldId === field.id
                            );

                          if (!response) return null;

                          return (
                            <Grid container key={field.id} sx={{ mb: 1 }}>
                              <Grid {...({ item: true, xs: 4, sm: 3 } as any)}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {field.name}:
                                </Typography>
                              </Grid>
                              <Grid {...({ item: true, xs: 8, sm: 9 } as any)}>
                                <Typography variant="body2">
                                  {field.type === "multi-select"
                                    ? JSON.parse(response.value).join(", ")
                                    : response.value}
                                </Typography>
                              </Grid>
                            </Grid>
                          );
                        })}
                      </Box>
                    );
                  }
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

        {/* Total */}
        {config.show_total && (
          <Box sx={{ mt: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TotalRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell align="right">
                      ${state.formData.totalPrice.toFixed(2)}
                    </TableCell>
                  </TotalRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
};

export default SummaryStep;
