// frontend/client-portal/src/components/booking/steps/EventTypeStep.tsx
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Skeleton,
  styled,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useClientBooking from "../../../hooks/useClientBooking";
import { EventType } from "../../../types/events.types";

const StyledCard = styled(Card)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    height: "100%",
    transition: "all 0.3s ease",
    border: selected
      ? `2px solid ${theme.palette.primary.main}`
      : "2px solid transparent",
    transform: selected ? "translateY(-4px)" : "none",
    boxShadow: selected ? theme.shadows[8] : theme.shadows[1],
    "&:hover": {
      boxShadow: theme.shadows[4],
      transform: "translateY(-2px)",
    },
  })
);

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const EventTypeStep: React.FC = () => {
  const { state, selectEventType, loadEventTypes } = useClientBooking();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventTypes = async () => {
      setIsLoading(true);
      const types = await loadEventTypes();
      setEventTypes(types);
      setIsLoading(false);
    };

    fetchEventTypes();
  }, [loadEventTypes]);

  const handleSelectEventType = async (id: number) => {
    setIsLoading(true);
    const success = await selectEventType(id);

    if (!success) {
      // Show error if booking flow couldn't be loaded
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Select Event Type
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Choose the type of event you'd like to book
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {isLoading
            ? Array.from(new Array(3)).map((_, index) => (
                <Grid
                  {...({ item: true, xs: 12, sm: 6, md: 4 } as any)}
                  key={`skeleton-${index}`}
                >
                  <Card>
                    <CardContent>
                      <Skeleton
                        variant="rectangular"
                        height={30}
                        width="60%"
                        sx={{ mb: 2 }}
                      />
                      <Skeleton variant="rectangular" height={80} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : eventTypes.map((type) => (
                <Grid
                  {...({ item: true, xs: 12, sm: 6, md: 4 } as any)}
                  key={type.id}
                >
                  <StyledCard selected={state.formData.eventType === type.id}>
                    <CardActionArea
                      onClick={() => handleSelectEventType(type.id)}
                      sx={{ height: "100%" }}
                    >
                      <StyledCardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {type.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </StyledCardContent>
                    </CardActionArea>
                  </StyledCard>
                </Grid>
              ))}
        </Grid>

        {eventTypes.length === 0 && !isLoading && (
          <Typography align="center" color="text.secondary">
            No event types available. Please contact support.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EventTypeStep;
