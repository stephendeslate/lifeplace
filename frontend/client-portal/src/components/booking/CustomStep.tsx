// frontend/client-portal/src/components/booking/CustomStep.tsx
import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { BookingStep } from "../../types/bookingflow.types";

interface CustomStepProps {
  step: BookingStep;
}

const CustomStep: React.FC<CustomStepProps> = ({ step }) => {
  const customConfig = step.custom_config;

  if (!customConfig) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">
          Custom step configuration not found.
        </Typography>
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

        {customConfig.html_content ? (
          <Box
            sx={{ mt: 2 }}
            dangerouslySetInnerHTML={{ __html: customConfig.html_content }}
          />
        ) : (
          <Typography color="text.secondary">This is a custom step.</Typography>
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

export default CustomStep;
