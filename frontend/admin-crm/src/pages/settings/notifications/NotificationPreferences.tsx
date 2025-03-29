// frontend/admin-crm/src/pages/settings/notifications/NotificationPreferences.tsx
import {
  Close as DisabledIcon,
  Email as EmailIcon,
  Check as EnabledIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  useNotificationPreferences,
  useNotificationTypes,
} from "../../../hooks/useNotifications";
import {
  NotificationPreferenceFormData,
  NotificationType,
} from "../../../types/notifications.types";

const NotificationPreferences: React.FC = () => {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useNotificationPreferences();
  const { notificationTypes, isLoading: isLoadingTypes } =
    useNotificationTypes();

  const [formData, setFormData] = useState<NotificationPreferenceFormData>({
    email_enabled: true,
    in_app_enabled: true,
    system_notifications: true,
    event_notifications: true,
    task_notifications: true,
    payment_notifications: true,
    client_notifications: true,
    contract_notifications: true,
    disabled_types: [],
  });

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        email_enabled: preferences.email_enabled,
        in_app_enabled: preferences.in_app_enabled,
        system_notifications: preferences.system_notifications,
        event_notifications: preferences.event_notifications,
        task_notifications: preferences.task_notifications,
        payment_notifications: preferences.payment_notifications,
        client_notifications: preferences.client_notifications,
        contract_notifications: preferences.contract_notifications,
        disabled_types: preferences.disabled_types,
      });
    }
  }, [preferences]);

  // Handle toggle change for switches
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked,
    });
  };

  // Handle toggle for notification types
  const handleTypeToggle = (typeId: number) => {
    const disabledTypes = formData.disabled_types || [];
    const newDisabledTypes = disabledTypes.includes(typeId)
      ? disabledTypes.filter((id) => id !== typeId)
      : [...disabledTypes, typeId];

    setFormData({
      ...formData,
      disabled_types: newDisabledTypes,
    });
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updatePreferences(formData);
  };

  // Group notification types by category
  const groupedTypes: Record<string, NotificationType[]> = {};

  notificationTypes.forEach((type) => {
    if (!groupedTypes[type.category]) {
      groupedTypes[type.category] = [];
    }
    groupedTypes[type.category].push(type);
  });

  return (
    <SettingsLayout
      title="Notification Preferences"
      description="Customize how and when you receive notifications"
    >
      {isLoading || isLoadingTypes ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Global Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Global Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <FormGroup>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.in_app_enabled}
                              onChange={handleToggleChange}
                              name="in_app_enabled"
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <NotificationsIcon sx={{ mr: 1 }} />
                              In-App Notifications
                            </Box>
                          }
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 4 }}
                        >
                          Receive notifications within the application
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.email_enabled}
                              onChange={handleToggleChange}
                              name="email_enabled"
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <EmailIcon sx={{ mr: 1 }} />
                              Email Notifications
                            </Box>
                          }
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 4 }}
                        >
                          Receive notifications via email
                        </Typography>
                      </Grid>
                    </Grid>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Categories
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <FormGroup>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.system_notifications}
                              onChange={handleToggleChange}
                              name="system_notifications"
                              color="primary"
                            />
                          }
                          label="System Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.event_notifications}
                              onChange={handleToggleChange}
                              name="event_notifications"
                              color="primary"
                            />
                          }
                          label="Event Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.task_notifications}
                              onChange={handleToggleChange}
                              name="task_notifications"
                              color="primary"
                            />
                          }
                          label="Task Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.payment_notifications}
                              onChange={handleToggleChange}
                              name="payment_notifications"
                              color="primary"
                            />
                          }
                          label="Payment Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.client_notifications}
                              onChange={handleToggleChange}
                              name="client_notifications"
                              color="primary"
                            />
                          }
                          label="Client Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.contract_notifications}
                              onChange={handleToggleChange}
                              name="contract_notifications"
                              color="primary"
                            />
                          }
                          label="Contract Notifications"
                        />
                      </Grid>
                    </Grid>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* Specific Notification Types */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Specific Notification Types
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {Object.entries(groupedTypes).map(([category, types]) => (
                    <Box key={category} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {category.replace("_", " ")} Notifications
                      </Typography>
                      <Grid container spacing={2}>
                        {types.map((type) => {
                          const isDisabled = formData.disabled_types?.includes(
                            type.id
                          );
                          return (
                            <Grid item xs={12} md={6} key={type.id}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  opacity: isDisabled ? 0.6 : 1,
                                }}
                              >
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 36,
                                      height: 36,
                                      borderRadius: 1,
                                      backgroundColor: `${type.color}15`,
                                      mr: 2,
                                    }}
                                  >
                                    <span
                                      className="material-icons"
                                      style={{
                                        color: type.color,
                                        fontSize: 20,
                                      }}
                                    >
                                      {type.icon}
                                    </span>
                                  </Box>
                                  <Box>
                                    <Typography variant="body1">
                                      {type.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {type.description}
                                    </Typography>
                                  </Box>
                                </Box>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={!isDisabled}
                                      onChange={() => handleTypeToggle(type.id)}
                                      icon={<DisabledIcon color="error" />}
                                      checkedIcon={
                                        <EnabledIcon color="success" />
                                      }
                                    />
                                  }
                                  label=""
                                />
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isUpdating ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Preferences"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
    </SettingsLayout>
  );
};

export default NotificationPreferences;
