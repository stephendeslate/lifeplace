// frontend/admin-crm/src/components/dashboard/RecentActivityCard.tsx
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { ActivityItem } from "../../types/dashboard.types";

interface RecentActivityCardProps {
  activities: ActivityItem[] | undefined;
  isLoading: boolean;
  limit?: number;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  isLoading,
  limit = 10,
}) => {
  const theme = useTheme();

  // Function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "TASK_COMPLETED":
        return <AssignmentIcon />;
      case "STATUS_CHANGE":
      case "STAGE_CHANGE":
        return <EventIcon />;
      case "PAYMENT_RECEIVED":
        return <PaymentIcon />;
      case "CONTRACT_SENT":
      case "CONTRACT_SIGNED":
      case "QUOTE_CREATED":
      case "QUOTE_UPDATED":
      case "QUOTE_ACCEPTED":
        return <DescriptionIcon />;
      case "CLIENT_MESSAGE":
        return <PersonIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  // Function to get color for activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "TASK_COMPLETED":
        return theme.palette.success.main;
      case "STATUS_CHANGE":
      case "STAGE_CHANGE":
        return theme.palette.info.main;
      case "PAYMENT_RECEIVED":
        return theme.palette.success.dark;
      case "CONTRACT_SENT":
      case "QUOTE_CREATED":
        return theme.palette.primary.main;
      case "CONTRACT_SIGNED":
      case "QUOTE_ACCEPTED":
        return theme.palette.success.main;
      case "CLIENT_MESSAGE":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Function to format activity timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      relativeTime: formatDistanceToNow(date, { addSuffix: true }),
      fullDate: format(date, "MMM d, yyyy h:mm a"),
    };
  };

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <Button component={Link} to="/events" size="small">
            View All
          </Button>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <List sx={{ width: "100%", pb: 0 }}>
            {[...Array(5)].map((_, index) => (
              <ListItem key={index} divider>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="80%" />}
                  secondary={<Skeleton width="50%" />}
                />
              </ListItem>
            ))}
          </List>
        ) : activities && activities.length > 0 ? (
          <List sx={{ width: "100%", pb: 0 }}>
            {activities.slice(0, limit).map((activity) => {
              const { relativeTime, fullDate } = formatTimestamp(
                activity.timestamp
              );
              return (
                <ListItem
                  key={activity.id}
                  divider
                  component={activity.event_id ? Link : "div"}
                  to={
                    activity.event_id
                      ? `/events/${activity.event_id}`
                      : undefined
                  }
                  sx={{
                    cursor: activity.event_id ? "pointer" : "default",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": activity.event_id
                      ? {
                          bgcolor: theme.palette.action.hover,
                        }
                      : {},
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" component="span">
                          {activity.description}
                        </Typography>
                        {activity.event_name && (
                          <Chip
                            label={activity.event_name}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {activity.actor_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          title={fullDate}
                        >
                          {relativeTime}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
