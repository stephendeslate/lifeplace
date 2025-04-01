// frontend/admin-crm/src/components/dashboard/DashboardLayout.tsx
import { Box, Grid } from "@mui/material";
import React, { ReactNode } from "react";
import { DashboardPreference } from "../../types/dashboard.types";

// Define types for widget configuration
interface WidgetConfig {
  gridSize: {
    xs: number;
    md?: number;
  };
  order: number;
}

// Define type for layout configuration
interface LayoutConfig {
  [key: string]: WidgetConfig;
}

interface DashboardLayoutProps {
  preferences?: DashboardPreference;
  children: {
    keyMetrics?: ReactNode;
    eventsOverview?: ReactNode;
    revenueOverview?: ReactNode;
    clientsOverview?: ReactNode;
    tasksOverview?: ReactNode;
    recentActivity?: ReactNode;
    [key: string]: ReactNode | undefined;
  };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  preferences,
  children,
}) => {
  // Default layout if no preferences set
  const defaultLayout: LayoutConfig = {
    keyMetrics: { gridSize: { xs: 12 }, order: 1 },
    eventsOverview: { gridSize: { xs: 12, md: 6 }, order: 2 },
    revenueOverview: { gridSize: { xs: 12, md: 6 }, order: 3 },
    clientsOverview: { gridSize: { xs: 12, md: 6 }, order: 4 },
    tasksOverview: { gridSize: { xs: 12, md: 6 }, order: 5 },
    recentActivity: { gridSize: { xs: 12 }, order: 6 },
  };

  // If user has preferences, use those for ordering
  let layout: LayoutConfig = { ...defaultLayout };

  if (preferences?.layout?.widgets && preferences?.layout?.layout) {
    // Create a custom layout based on preferences
    const customLayout: LayoutConfig = {};

    preferences.layout.widgets.forEach((widgetKey) => {
      const widgetConfig = preferences.layout.layout[widgetKey];
      if (widgetConfig) {
        // Set grid size based on widget size preference
        let gridSize: { xs: number; md?: number } = { xs: 12 };
        if (widgetConfig.size === "small") {
          gridSize = { xs: 12, md: 4 };
        } else if (widgetConfig.size === "medium") {
          gridSize = { xs: 12, md: 6 };
        }

        customLayout[widgetKey] = {
          gridSize,
          order: widgetConfig.position,
        };
      }
    });

    // Only override the layout if we have custom layout data
    if (Object.keys(customLayout).length > 0) {
      layout = { ...customLayout };
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Key metrics always at top full width */}
      {children.keyMetrics && <Box sx={{ mb: 3 }}>{children.keyMetrics}</Box>}

      {/* Main layout grid */}
      <Grid container spacing={3}>
        {/* Render all child components in their grid positions */}
        {Object.entries(children).map(([key, component]) => {
          // Skip key metrics as we've already rendered it
          if (key === "keyMetrics" || !component) return null;

          // Use the layout config for this key, or a default if not found
          const config = layout[key] || { gridSize: { xs: 12 }, order: 999 };

          return (
            <Grid
              item
              key={key}
              xs={config.gridSize.xs}
              md={config.gridSize.md}
              sx={{ order: config.order, mb: 2 }}
            >
              {component}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DashboardLayout;
