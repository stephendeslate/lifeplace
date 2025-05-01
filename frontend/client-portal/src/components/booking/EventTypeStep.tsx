// frontend/client-portal/src/components/booking/EventTypeStep.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { bookingFlowApi } from "../../apis/bookingflow.api";
import { EventType } from "../../shared/types/events.types";

interface EventTypeStepProps {
  onSelect: (eventTypeId: number) => void;
  selectedEventType: number | null;
}

const EventTypeStep: React.FC<EventTypeStepProps> = ({
  onSelect,
  selectedEventType,
}) => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        const types = await bookingFlowApi.getEventTypes();
        setEventTypes(types);
      } catch (err) {
        setError("Failed to load event types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Select Event Type
      </Typography>
      <Grid container spacing={3}>
        {eventTypes.map((type) => (
          <Grid
            {...({ item: true, xs: 12, sm: 6, md: 4, key: type.id } as any)}
          >
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
                border: selectedEventType === type.id ? "2px solid" : "none",
                borderColor: "primary.main",
              }}
              onClick={() => onSelect(type.id)}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {type.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
                <Button
                  variant={
                    selectedEventType === type.id ? "contained" : "outlined"
                  }
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => onSelect(type.id)}
                >
                  {selectedEventType === type.id ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventTypeStep;
