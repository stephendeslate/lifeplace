// frontend/client-portal/src/components/booking/SummaryStep.tsx
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { BookingStep, BookingSummary } from "../../types/bookingflow.types";

interface SummaryStepProps {
  step: BookingStep;
  summary: BookingSummary | null;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ step, summary }) => {
  if (!summary) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">Booking summary not available.</Typography>
      </Box>
    );
  }

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

        <Grid container spacing={3}>
          <Grid {...({ item: true, xs: 12, md: 6 } as any)}>
            <Typography variant="subtitle1" gutterBottom>
              Event Details
            </Typography>

            <List disablePadding>
              <ListItem disableGutters divider>
                <ListItemText
                  primary="Event Type"
                  secondary={summary.eventType.name}
                />
              </ListItem>

              <ListItem disableGutters divider>
                <ListItemText
                  primary="Date"
                  secondary={
                    summary.date
                      ? format(new Date(summary.date), "PPPP")
                      : "Not selected"
                  }
                />
              </ListItem>

              {summary.time && (
                <ListItem disableGutters divider>
                  <ListItemText
                    primary="Time"
                    secondary={format(
                      new Date(`2000-01-01T${summary.time}`),
                      "h:mm a"
                    )}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          <Grid {...({ item: true, xs: 12, md: 6 } as any)}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Products
            </Typography>

            {summary.products.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No products selected
              </Typography>
            ) : (
              <List disablePadding>
                {summary.products.map((product, index) => (
                  <ListItem
                    key={index}
                    disableGutters
                    divider={index < summary.products.length - 1}
                  >
                    <ListItemText
                      primary={product.name}
                      secondary={`Quantity: ${product.quantity}`}
                    />
                    <Typography variant="body2">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}

            {summary.addons.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Add-ons
                </Typography>

                <List disablePadding>
                  {summary.addons.map((addon, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      divider={index < summary.addons.length - 1}
                    >
                      <ListItemText
                        primary={addon.name}
                        secondary={`Quantity: ${addon.quantity}`}
                      />
                      <Typography variant="body2">
                        ${addon.price.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h5" color="primary">
            ${summary.totalPrice.toFixed(2)}
          </Typography>
        </Box>

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

export default SummaryStep;
