// frontend/admin-crm/src/components/dashboard/EventsOverviewCard.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { EventsOverview } from "../../types/dashboard.types";
import { EventStatus } from "../../types/events.types";
import DashboardChart from "./DashboardChart";

interface EventsOverviewCardProps {
  eventsOverview: EventsOverview | undefined;
  isLoading: boolean;
}

// Helper function to get color for event status
// Helper function to get color for event status
const getStatusColor = (
  status: EventStatus
): "info" | "primary" | "success" | "error" | "warning" => {
  switch (status) {
    case "LEAD":
      return "info";
    case "CONFIRMED":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "warning"; // Changed from 'default' to 'warning'
  }
};

const EventsOverviewCard: React.FC<EventsOverviewCardProps> = ({
  eventsOverview,
  isLoading,
}) => {
  const theme = useTheme();

  // Determine trend icon and color
  const getTrendIcon = (trend: "up" | "down" | "flat" | null) => {
    if (trend === "up")
      return (
        <ArrowUpwardIcon
          fontSize="small"
          sx={{ color: theme.palette.success.main }}
        />
      );
    if (trend === "down")
      return (
        <ArrowDownwardIcon
          fontSize="small"
          sx={{ color: theme.palette.error.main }}
        />
      );
    return (
      <RemoveIcon
        fontSize="small"
        sx={{ color: theme.palette.text.secondary }}
      />
    );
  };

  return (
    <Card>
      <CardHeader
        title="Events Overview"
        subheader={
          eventsOverview && !isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Events: {eventsOverview.total_events}
              </Typography>
              {eventsOverview.change !== null && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  {getTrendIcon(eventsOverview.trend)}
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      color:
                        eventsOverview.trend === "up"
                          ? theme.palette.success.main
                          : eventsOverview.trend === "down"
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                    }}
                  >
                    {eventsOverview.change > 0 ? "+" : ""}
                    {eventsOverview.change}%
                  </Typography>
                  {eventsOverview.comparison_label && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {eventsOverview.comparison_label}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : isLoading ? (
            <Skeleton width="60%" />
          ) : null
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Events by Status
            </Typography>
            {isLoading ? (
              <Box sx={{ mt: 2 }}>
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} height={36} sx={{ mb: 1 }} />
                  ))}
              </Box>
            ) : (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3, mt: 1 }}
              >
                {eventsOverview?.events_by_status &&
                  Object.entries(eventsOverview.events_by_status).map(
                    ([status, count]) => (
                      <Chip
                        key={status}
                        label={`${status}: ${count}`}
                        color={getStatusColor(status as EventStatus)}
                        variant="outlined"
                        size="small"
                      />
                    )
                  )}
              </Box>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 3 }}>
              Upcoming Events
            </Typography>
            {isLoading ? (
              <Box>
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                  ))}
              </Box>
            ) : (
              <List sx={{ width: "100%" }}>
                {eventsOverview?.upcoming_events &&
                eventsOverview.upcoming_events.length > 0 ? (
                  eventsOverview.upcoming_events.slice(0, 4).map((event) => (
                    <ListItem
                      key={event.id}
                      sx={{
                        borderLeft: `4px solid ${
                          theme.palette[getStatusColor(event.status)].main
                        }`,
                        mb: 1,
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                      }}
                      dense
                    >
                      <ListItemText
                        primary={event.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {format(
                                new Date(event.start_date),
                                "MMM d, yyyy"
                              )}
                            </Typography>
                            {" — "}
                            <Chip
                              label={event.event_type_name}
                              size="small"
                              variant="outlined"
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming events
                  </Typography>
                )}
              </List>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Events Trend
            </Typography>
            <Box sx={{ height: 250 }}>
              <DashboardChart
                chartData={eventsOverview?.events_trend}
                isLoading={isLoading}
                height={250}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EventsOverviewCard;
