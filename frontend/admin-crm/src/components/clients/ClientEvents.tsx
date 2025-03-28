// frontend/admin-crm/src/components/clients/ClientEvents.tsx
import {
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { Event } from "../../types/events.types";
import { EventProgress, EventStatusChip } from "../events";

interface ClientEventsProps {
  events: Event[];
  isLoading: boolean;
  onViewEvent: (eventId: number) => void;
}

const ClientEvents: React.FC<ClientEventsProps> = ({
  events,
  isLoading,
  onViewEvent,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CalendarIcon sx={{ fontSize: 40, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This client doesn't have any events yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Client Events"
        subheader={`${events.length} total events`}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <List disablePadding>
          {events.map((event) => (
            <React.Fragment key={event.id}>
              <ListItem
                secondaryAction={
                  <Tooltip title="View Event">
                    <IconButton
                      edge="end"
                      onClick={() => onViewEvent(event.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        {event.name}
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        <EventStatusChip status={event.status} size="small" />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          color: "text.secondary",
                        }}
                      >
                        <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" component="span">
                          {format(new Date(event.start_date), "MMM d, yyyy")}
                          {event.end_date &&
                            ` - ${format(
                              new Date(event.end_date),
                              "MMM d, yyyy"
                            )}`}
                        </Typography>
                      </Box>

                      {/* Event type */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Type: {event.event_type_name}
                      </Typography>

                      {/* Payment status */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        Payment: {event.payment_status}
                        {event.total_amount_due && (
                          <span>
                            {" "}
                            (
                            {(
                              (event.total_amount_paid /
                                event.total_amount_due) *
                              100
                            ).toFixed(0)}
                            % paid)
                          </span>
                        )}
                      </Typography>

                      {/* Progress bar */}
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Workflow Progress:
                        {event.current_stage_name
                          ? ` ${event.current_stage_name}`
                          : " Not started"}
                      </Typography>
                      <EventProgress
                        progress={event.workflow_progress}
                        showPercentage
                        height={8}
                      />
                    </Box>
                  }
                  primaryTypographyProps={{
                    component: "div",
                  }}
                  secondaryTypographyProps={{
                    component: "div",
                  }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ClientEvents;
