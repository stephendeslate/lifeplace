// frontend/client-portal/src/components/booking/steps/IntroStep.tsx
import { Box, Paper, TextField, Typography, styled } from "@mui/material";
import React from "react";
import useClientBooking from "../../../hooks/useClientBooking";
import { IntroConfig } from "../../../types/booking.types";
import { EventType } from "../../../types/events.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

interface IntroStepProps {
  config: IntroConfig;
  eventTypeDetails?: EventType;
}

const IntroStep: React.FC<IntroStepProps> = ({ config, eventTypeDetails }) => {
  const { state, setEventName } = useClientBooking();

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      {config.show_event_details && eventTypeDetails && (
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            {eventTypeDetails.name}
          </Typography>
          <Typography variant="body2" paragraph>
            {eventTypeDetails.description}
          </Typography>
        </StyledPaper>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Event Name
        </Typography>
        <TextField
          fullWidth
          label="Give your event a name (optional)"
          placeholder="e.g. John's Birthday Party"
          value={state.formData.eventName}
          onChange={(e) => setEventName(e.target.value)}
          variant="outlined"
          helperText="This will help you identify your booking"
        />
      </Box>
    </Box>
  );
};

export default IntroStep;
