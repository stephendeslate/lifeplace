// frontend/admin-crm/src/components/dashboard/MetricsCard.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { DashboardMetric } from "../../types/dashboard.types";

interface MetricItemProps {
  metric: DashboardMetric;
}

const MetricItem: React.FC<MetricItemProps> = ({ metric }) => {
  const theme = useTheme();

  // Determine trend color
  const trendColor =
    metric.trend === "up"
      ? theme.palette.success.main
      : metric.trend === "down"
      ? theme.palette.error.main
      : theme.palette.text.secondary;

  // Determine trend icon
  const TrendIcon =
    metric.trend === "up"
      ? ArrowUpwardIcon
      : metric.trend === "down"
      ? ArrowDownwardIcon
      : RemoveIcon;

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {metric.label}
        </Typography>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {metric.value}
        </Typography>

        {metric.change !== null && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <TrendIcon
              fontSize="small"
              sx={{
                color: trendColor,
                mr: 0.5,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: trendColor,
                mr: 1,
                fontWeight: "medium",
              }}
            >
              {metric.change > 0 ? "+" : ""}
              {metric.change}%
            </Typography>

            {metric.comparison_label && (
              <Typography variant="caption" color="textSecondary">
                {metric.comparison_label}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

interface MetricsCardProps {
  metrics: DashboardMetric[] | undefined;
  isLoading: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metrics, isLoading }) => {
  return (
    <Grid container spacing={3}>
      {isLoading
        ? Array(4)
            .fill(0)
            .map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={`metric-skeleton-${i}`}>
                <Card elevation={1} sx={{ height: "100%" }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={40}
                      sx={{ my: 1 }}
                    />
                    <Skeleton variant="text" width="40%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))
        : metrics?.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={`metric-${index}`}>
              <MetricItem metric={metric} />
            </Grid>
          ))}
    </Grid>
  );
};

export default MetricsCard;
