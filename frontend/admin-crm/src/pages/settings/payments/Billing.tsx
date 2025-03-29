// frontend/admin-crm/src/pages/settings/payments/Billing.tsx
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import React from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";

const Billing: React.FC = () => {
  return (
    <SettingsLayout
      title="Billing"
      description="View invoices and billing history for your account"
    >
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Plan
            </Typography>
            <Typography variant="body1">
              You are currently on the Business Plan
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Alert severity="info">
              Billing information and features coming soon. This section will
              allow you to manage your subscription, view invoices, and update
              payment methods for your account.
            </Alert>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Billing History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No billing history available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
};

export default Billing;
