// frontend/client-portal/src/components/booking/StepLayout.tsx
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import React from "react";

interface StepLayoutProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  description,
  loading = false,
  error = null,
  children,
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {description}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StepLayout;
