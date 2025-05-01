// frontend/client-portal/src/pages/booking/BookingPage.tsx
import { Box, Container } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import BookingWizard from "../../components/booking/BookingWizard";

const BookingPage: React.FC = () => {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const initialEventTypeId = eventTypeId ? parseInt(eventTypeId) : undefined;

  return (
    <Box sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      <Container maxWidth="lg">
        <BookingWizard initialEventTypeId={initialEventTypeId} />
      </Container>
    </Box>
  );
};

export default BookingPage;
