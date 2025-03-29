// frontend/admin-crm/src/components/notifications/NotificationPanel.tsx
import {
  Close as CloseIcon,
  DoneAll as MarkAllReadIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ReadIcon,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  Popover,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

interface NotificationPanelProps {
  maxHeight?: number;
  width?: number;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  maxHeight = 400,
  width = 350,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const {
    recentNotifications,
    isLoadingRecent,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    isMarkingAllAsRead,
    refetch,
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    refetch(); // Refresh data when opening panel
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleDelete = (id: number) => {
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    navigate("/settings/notifications/management");
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <>
      {/* Notification Bell Button */}
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            width,
            maxHeight,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <IconButton
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAllAsRead}
              title="Mark all as read"
            >
              {isMarkingAllAsRead ? (
                <CircularProgress size={20} />
              ) : (
                <MarkAllReadIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton size="small" onClick={handleClose} title="Close">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Notification List */}
        <List sx={{ overflow: "auto", flex: 1, p: 0 }}>
          {isLoadingRecent ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 100,
              }}
            >
              <CircularProgress />
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                height: 150,
                p: 2,
                textAlign: "center",
              }}
            >
              <NotificationsIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClose={handleClose}
              />
            ))
          )}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleViewAll}
            size="small"
            endIcon={<ReadIcon />}
            sx={{ textTransform: "none" }}
          >
            View All Notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPanel;
