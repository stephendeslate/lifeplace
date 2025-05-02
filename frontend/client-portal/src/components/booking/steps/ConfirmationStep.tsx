// frontend/client-portal/src/components/booking/steps/ConfirmationStep.tsx
import { Check as CheckIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import useClientBooking from "../../../hooks/useClientBooking";
import { ConfirmationConfig } from "../../../types/booking.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  textAlign: "center",
}));

const SuccessIcon = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, "auto"),
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.common.white,
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

interface ConfirmationStepProps {
  config: ConfirmationConfig;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ config }) => {
  const { state } = useClientBooking();

  return (
    <Box>
      <StyledPaper elevation={3}>
        <SuccessIcon>
          <CheckIcon fontSize="large" />
        </SuccessIcon>

        <Typography variant="h5" gutterBottom>
          {config.title}
        </Typography>

        <Typography variant="body1" paragraph>
          {config.description}
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontWeight: "bold" }}>
          {config.success_message}
        </Typography>

        {config.show_summary && (
          <SummaryBox>
            <Typography variant="subtitle1" gutterBottom>
              Booking Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid {...({ item: true, xs: 6, sm: 4 } as any)}>
                <Typography variant="body2" color="text.secondary">
                  Booking ID:
                </Typography>
              </Grid>
              <Grid {...({ item: true, xs: 6, sm: 8 } as any)}>
                <Typography variant="body2">{state.eventId}</Typography>
              </Grid>

              <Grid {...({ item: true, xs: 6, sm: 4 } as any)}>
                <Typography variant="body2" color="text.secondary">
                  Event Type:
                </Typography>
              </Grid>
              <Grid {...({ item: true, xs: 6, sm: 8 } as any)}>
                <Typography variant="body2">{state.flowId}</Typography>
              </Grid>

              <Grid {...({ item: true, xs: 6, sm: 4 } as any)}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount:
                </Typography>
              </Grid>
              <Grid {...({ item: true, xs: 6, sm: 8 } as any)}>
                <Typography variant="body2">
                  ${state.formData.totalPrice.toFixed(2)}
                </Typography>
              </Grid>

              {state.formData.depositOnly && (
                <>
                  <Grid {...({ item: true, xs: 6, sm: 4 } as any)}>
                    <Typography variant="body2" color="text.secondary">
                      Paid Amount:
                    </Typography>
                  </Grid>
                  <Grid {...({ item: true, xs: 6, sm: 8 } as any)}>
                    <Typography variant="body2">
                      ${state.formData.depositAmount.toFixed(2)} (Deposit)
                    </Typography>
                  </Grid>

                  <Grid {...({ item: true, xs: 6, sm: 4 } as any)}>
                    <Typography variant="body2" color="text.secondary">
                      Balance Due:
                    </Typography>
                  </Grid>
                  <Grid {...({ item: true, xs: 6, sm: 8 } as any)}>
                    <Typography variant="body2">
                      $
                      {(
                        state.formData.totalPrice - state.formData.depositAmount
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </SummaryBox>
        )}

        {config.send_email && (
          <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
            A confirmation email has been sent to your registered email address.
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/dashboard"
            size="large"
            sx={{ mx: 1 }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
            size="large"
            sx={{ mx: 1 }}
          >
            Return Home
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default ConfirmationStep;
