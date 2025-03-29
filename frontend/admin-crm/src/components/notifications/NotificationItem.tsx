// frontend/admin-crm/src/components/notifications/NotificationItem.tsx
import {
  Circle as CircleIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Notification } from "../../types/notifications.types";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}) => {
  const handleClick = () => {
    // If notification is not read, mark it as read
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // If there's an action URL, navigate to it
    if (notification.action_url && onClose) {
      window.location.href = notification.action_url;
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  // Get icon and color from notification type
  const icon = notification.notification_type_details?.icon || "notifications";
  const color = notification.notification_type_details?.color || "#2196f3";

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton edge="end" onClick={handleDelete} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      }
      sx={{
        backgroundColor: notification.is_read ? "inherit" : "action.hover",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <ListItemButton onClick={handleClick}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mr: 1,
            color,
            position: "relative",
          }}
        >
          {/* Notification icon */}
          <Box
            component="span"
            sx={{
              display: "flex",
              width: 36,
              height: 36,
              backgroundColor: `${color}15`,
              borderRadius: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>
              {icon}
            </span>
          </Box>

          {/* Unread indicator */}
          {!notification.is_read && (
            <CircleIcon
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                fontSize: 10,
                color: "primary.main",
              }}
            />
          )}
        </Box>

        <ListItemText
          primary={
            <Typography
              variant="subtitle2"
              component="div"
              sx={{
                fontWeight: notification.is_read ? "normal" : "bold",
                mb: 0.5,
              }}
            >
              {notification.title}
            </Typography>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {notification.content}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TimeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </Typography>
              </Box>
            </Box>
          }
          secondaryTypographyProps={{ component: "div" }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationItem;
