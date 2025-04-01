// frontend/admin-crm/src/components/dashboard/ClientsOverviewCard.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleIcon from "@mui/icons-material/People";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { ClientsOverview } from "../../types/dashboard.types";
import DashboardChart from "./DashboardChart";

interface ClientsOverviewCardProps {
  clientsOverview: ClientsOverview | undefined;
  isLoading: boolean;
}

const ClientsOverviewCard: React.FC<ClientsOverviewCardProps> = ({
  clientsOverview,
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

  // Function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader
        title="Clients Overview"
        subheader={
          clientsOverview && !isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                New Clients: {clientsOverview.new_clients}
              </Typography>
              {clientsOverview.change !== null && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  {getTrendIcon(clientsOverview.trend)}
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      color:
                        clientsOverview.trend === "up"
                          ? theme.palette.success.main
                          : clientsOverview.trend === "down"
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                    }}
                  >
                    {clientsOverview.change > 0 ? "+" : ""}
                    {clientsOverview.change}%
                  </Typography>
                  {clientsOverview.comparison_label && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {clientsOverview.comparison_label}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : isLoading ? (
            <Skeleton width="60%" />
          ) : null
        }
        action={
          <Button
            component={Link}
            to="/clients"
            size="small"
            endIcon={<PeopleIcon />}
          >
            View Clients
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={12}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: theme.palette.background.default,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      color="text.secondary"
                    >
                      Total Clients
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="text" width="100%" height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight="bold">
                        {clientsOverview?.total_clients || 0}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={12}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: theme.palette.background.default,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      color="text.secondary"
                    >
                      Active Clients
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="text" width="100%" height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight="bold">
                        {clientsOverview?.active_clients || 0}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              Recent Clients
            </Typography>
            {isLoading ? (
              <>
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} />
              </>
            ) : clientsOverview?.recent_clients &&
              clientsOverview.recent_clients.length > 0 ? (
              <List sx={{ width: "100%" }} dense>
                {clientsOverview.recent_clients.slice(0, 3).map((client) => (
                  <ListItem
                    key={client.id}
                    sx={{
                      mb: 1,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1,
                    }}
                    component={Link}
                    to={`/clients/${client.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <ListItemAvatar>
                      <Avatar alt={client.first_name + " " + client.last_name}>
                        {getInitials(
                          client.first_name + " " + client.last_name
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${client.first_name} ${client.last_name}`}
                      secondary={format(
                        new Date(client.date_joined),
                        "MMM d, yyyy"
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent clients
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Client Acquisition Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <DashboardChart
                chartData={clientsOverview?.clients_trend}
                isLoading={isLoading}
                height={300}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClientsOverviewCard;
