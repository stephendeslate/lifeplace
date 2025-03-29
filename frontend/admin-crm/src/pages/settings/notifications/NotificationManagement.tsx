// frontend/admin-crm/src/pages/settings/notifications/NotificationManagement.tsx
import {
  Delete as DeleteIcon,
  Filter as FilterIcon,
  CheckCircleOutline as ReadIcon,
  RadioButtonUnchecked as UnreadIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useNotifications } from "../../../hooks/useNotifications";
import { Notification } from "../../../types/notifications.types";

const NotificationManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [readFilter, setReadFilter] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    []
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const isReadValue =
    readFilter === "read" ? true : readFilter === "unread" ? false : undefined;

  const {
    notifications,
    totalCount,
    isLoading,
    markAsRead,
    markAsUnread,
    deleteNotification,
    bulkAction,
    isBulkActioning,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications(page + 1, isReadValue);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle read filter change
  const handleReadFilterChange = (event: SelectChangeEvent<string>) => {
    setReadFilter(event.target.value as string);
    setPage(0);
  };

  // Toggle notification selection
  const toggleNotificationSelection = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((itemId) => itemId !== id)
      );
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Select all notifications
  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n.id));
    }
  };

  // Mark notification as read/unread
  const toggleNotificationReadStatus = (notification: Notification) => {
    if (notification.is_read) {
      markAsUnread(notification.id);
    } else {
      markAsRead(notification.id);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = (id: number) => {
    deleteNotification(id);
  };

  // Handle bulk actions
  const handleBulkAction = (action: "mark_read" | "mark_unread" | "delete") => {
    if (selectedNotifications.length === 0) return;

    bulkAction({
      notification_ids: selectedNotifications,
      action,
    });
    setSelectedNotifications([]);
    setConfirmDeleteOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setConfirmClearOpen(false);
  };

  return (
    <SettingsLayout
      title="Notification Management"
      description="View and manage all your notifications"
    >
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 150, mr: 2 }}
          >
            <InputLabel id="read-filter-label">Filter</InputLabel>
            <Select
              labelId="read-filter-label"
              value={readFilter}
              onChange={handleReadFilterChange}
              label="Filter"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Notifications</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ReadIcon />}
            onClick={() => setConfirmClearOpen(true)}
            disabled={isMarkingAllAsRead}
            sx={{ mr: 1 }}
          >
            Mark All as Read
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReadIcon />}
            disabled={selectedNotifications.length === 0 || isBulkActioning}
            onClick={() => handleBulkAction("mark_read")}
            sx={{ mr: 1 }}
          >
            Mark as Read
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<UnreadIcon />}
            disabled={selectedNotifications.length === 0 || isBulkActioning}
            onClick={() => handleBulkAction("mark_unread")}
            sx={{ mr: 1 }}
          >
            Mark as Unread
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={selectedNotifications.length === 0}
            onClick={() => setConfirmDeleteOpen(true)}
          >
            Delete Selected
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={
                    notifications.length > 0 &&
                    selectedNotifications.length === notifications.length
                  }
                  onChange={selectAllNotifications}
                />
              </TableCell>
              <TableCell>Notification</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" sx={{ py: 5 }}>
                    No notifications found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  sx={{
                    backgroundColor: notification.is_read
                      ? "inherit"
                      : "action.hover",
                  }}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() =>
                        toggleNotificationSelection(notification.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          mt: 0.5,
                          mr: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          backgroundColor: `${
                            notification.notification_type_details?.color ||
                            "#2196f3"
                          }15`,
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{
                            color:
                              notification.notification_type_details?.color ||
                              "#2196f3",
                            fontSize: 20,
                          }}
                        >
                          {notification.notification_type_details?.icon ||
                            "notifications"}
                        </span>
                      </Box>

                      {/* Content */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.is_read
                              ? "normal"
                              : "bold",
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {notification.content}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        notification.notification_type_details?.name ||
                        "Notification"
                      }
                      size="small"
                      sx={{
                        backgroundColor: `${
                          notification.notification_type_details?.color ||
                          "#2196f3"
                        }15`,
                        color:
                          notification.notification_type_details?.color ||
                          "#2196f3",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip
                      title={
                        notification.is_read ? "Mark as unread" : "Mark as read"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          toggleNotificationReadStatus(notification)
                        }
                      >
                        {notification.is_read ? (
                          <UnreadIcon fontSize="small" />
                        ) : (
                          <ReadIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Notifications</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            {selectedNotifications.length === 1
              ? "this notification"
              : `these ${selectedNotifications.length} notifications`}
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleBulkAction("delete")}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Mark All Read Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
      >
        <DialogTitle>Mark All as Read</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark all notifications as read?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMarkAllAsRead}
            color="primary"
            variant="contained"
            startIcon={<ReadIcon />}
          >
            Mark All as Read
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default NotificationManagement;
