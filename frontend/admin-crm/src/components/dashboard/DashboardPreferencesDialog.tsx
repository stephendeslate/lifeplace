// frontend/admin-crm/src/components/dashboard/DashboardPreferencesDialog.tsx
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useDashboard from "../../hooks/useDashboard";
import {
  DashboardLayout,
  DashboardPreferenceFormData,
  TimeRange,
} from "../../types/dashboard.types";

// Define widget size type for typesafety
type WidgetSize = "small" | "medium" | "large";

// Available widgets
const availableWidgets = [
  {
    id: "eventsOverview",
    name: "Events Overview",
    defaultSize: "medium" as WidgetSize,
  },
  {
    id: "revenueOverview",
    name: "Revenue Overview",
    defaultSize: "medium" as WidgetSize,
  },
  {
    id: "clientsOverview",
    name: "Clients Overview",
    defaultSize: "medium" as WidgetSize,
  },
  {
    id: "tasksOverview",
    name: "Tasks Overview",
    defaultSize: "medium" as WidgetSize,
  },
  {
    id: "recentActivity",
    name: "Recent Activity",
    defaultSize: "large" as WidgetSize,
  },
];

// Default empty layout
const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: [],
  layout: {},
};

interface DashboardPreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

const DashboardPreferencesDialog: React.FC<DashboardPreferencesDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const { useGetUserPreferences, useUpdateUserPreferences } = useDashboard();

  // Query user preferences
  const { data: preferences, isLoading } = useGetUserPreferences();
  const updatePreferencesMutation = useUpdateUserPreferences();

  // Local state for preferences form - initialize with proper structure
  const [formData, setFormData] = useState<DashboardPreferenceFormData>({
    default_time_range: "week",
    layout: DEFAULT_LAYOUT,
  });

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        default_time_range: preferences.default_time_range,
        layout: {
          widgets: [...preferences.layout.widgets],
          layout: { ...preferences.layout.layout },
        },
      });
    }
  }, [preferences]);

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent<TimeRange>) => {
    setFormData({
      ...formData,
      default_time_range: event.target.value as TimeRange,
    });
  };

  // Handle widget toggle
  const handleWidgetToggle = (widgetId: string) => {
    // Ensure we have a copy of the current state
    const layoutData = formData.layout || DEFAULT_LAYOUT;
    const currentWidgets = [...layoutData.widgets];
    const currentLayout = { ...layoutData.layout };

    // Check if widget is already enabled
    const isEnabled = currentWidgets.includes(widgetId);

    let newWidgets: string[];
    let newLayout: DashboardLayout["layout"]; // Use type from interface

    if (isEnabled) {
      // Remove widget
      newWidgets = currentWidgets.filter((id) => id !== widgetId);

      // Remove from layout
      newLayout = { ...currentLayout };
      delete newLayout[widgetId];

      // Reorder remaining widgets
      let position = 1;
      Object.keys(newLayout).forEach((key) => {
        newLayout[key] = {
          ...newLayout[key],
          position: position++,
        };
      });
    } else {
      // Add widget
      newWidgets = [...currentWidgets, widgetId];

      // Add to layout with default position (at the end) and default size
      const widgetConfig = availableWidgets.find((w) => w.id === widgetId);
      const defaultSize = widgetConfig
        ? widgetConfig.defaultSize
        : ("medium" as WidgetSize);

      newLayout = {
        ...currentLayout,
        [widgetId]: {
          position: newWidgets.length,
          size: defaultSize,
        },
      };
    }

    // Create a new layout object that matches the DashboardLayout type
    const newDashboardLayout: DashboardLayout = {
      widgets: newWidgets,
      layout: newLayout,
    };

    setFormData({
      ...formData,
      layout: newDashboardLayout,
    });
  };

  // Handle widget size change
  const handleWidgetSizeChange = (widgetId: string, size: WidgetSize) => {
    const layoutData = formData.layout || DEFAULT_LAYOUT;
    const currentLayout = { ...layoutData.layout };
    const currentWidgets = [...layoutData.widgets];

    // Create a new layout with the updated size
    const newLayout: DashboardLayout = {
      widgets: currentWidgets,
      layout: {
        ...currentLayout,
        [widgetId]: {
          ...currentLayout[widgetId],
          size,
        },
      },
    };

    setFormData({
      ...formData,
      layout: newLayout,
    });
  };

  // Handle save
  const handleSave = () => {
    // Form data should already have the correct structure now
    updatePreferencesMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // Get current layout data safely
  const layoutData = formData.layout || DEFAULT_LAYOUT;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle>Dashboard Preferences</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Default Time Range
            </Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel id="time-range-select-label">Time Range</InputLabel>
              <Select<TimeRange>
                labelId="time-range-select-label"
                id="time-range-select"
                value={formData.default_time_range || "week"}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="day">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Customize Widgets
            </Typography>
            <Grid container spacing={3}>
              {availableWidgets.map((widget) => {
                const isEnabled = layoutData.widgets.includes(widget.id);
                const widgetLayout = layoutData.layout[widget.id];
                const currentSize = widgetLayout?.size || widget.defaultSize;

                return (
                  <Grid item xs={12} sm={6} key={widget.id}>
                    <Card
                      variant={isEnabled ? "outlined" : "elevation"}
                      sx={{
                        borderColor: isEnabled
                          ? theme.palette.primary.main
                          : undefined,
                        bgcolor: isEnabled
                          ? `rgba(10, 132, 255, 0.05)`
                          : theme.palette.background.paper,
                        position: "relative",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <DragIndicatorIcon
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography variant="subtitle2">
                              {widget.name}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isEnabled}
                                onChange={() => handleWidgetToggle(widget.id)}
                                color="primary"
                              />
                            }
                            label=""
                          />
                        </Box>

                        {isEnabled && (
                          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                            <Chip
                              label="Small"
                              variant={
                                currentSize === "small" ? "filled" : "outlined"
                              }
                              color={
                                currentSize === "small" ? "primary" : "default"
                              }
                              onClick={() =>
                                handleWidgetSizeChange(widget.id, "small")
                              }
                              size="small"
                              clickable
                            />
                            <Chip
                              label="Medium"
                              variant={
                                currentSize === "medium" ? "filled" : "outlined"
                              }
                              color={
                                currentSize === "medium" ? "primary" : "default"
                              }
                              onClick={() =>
                                handleWidgetSizeChange(widget.id, "medium")
                              }
                              size="small"
                              clickable
                            />
                            <Chip
                              label="Large"
                              variant={
                                currentSize === "large" ? "filled" : "outlined"
                              }
                              color={
                                currentSize === "large" ? "primary" : "default"
                              }
                              onClick={() =>
                                handleWidgetSizeChange(widget.id, "large")
                              }
                              size="small"
                              clickable
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isLoading || updatePreferencesMutation.isPending}
        >
          {updatePreferencesMutation.isPending
            ? "Saving..."
            : "Save Preferences"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardPreferencesDialog;
