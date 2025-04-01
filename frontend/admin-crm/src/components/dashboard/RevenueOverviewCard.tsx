// frontend/admin-crm/src/components/dashboard/RevenueOverviewCard.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
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
import { Link } from "react-router-dom";
import { RevenueOverview } from "../../types/dashboard.types";
import DashboardChart from "./DashboardChart";

interface RevenueOverviewCardProps {
  revenueOverview: RevenueOverview | undefined;
  isLoading: boolean;
}

const RevenueOverviewCard: React.FC<RevenueOverviewCardProps> = ({
  revenueOverview,
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

  // Format currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader
        title="Revenue Overview"
        subheader={
          revenueOverview && !isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Total Revenue: {formatCurrency(revenueOverview.total_revenue)}
              </Typography>
              {revenueOverview.change !== null && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  {getTrendIcon(revenueOverview.trend)}
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      color:
                        revenueOverview.trend === "up"
                          ? theme.palette.success.main
                          : revenueOverview.trend === "down"
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                    }}
                  >
                    {revenueOverview.change > 0 ? "+" : ""}
                    {revenueOverview.change}%
                  </Typography>
                  {revenueOverview.comparison_label && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {revenueOverview.comparison_label}
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
            to="/payments"
            size="small"
            endIcon={<CreditCardIcon />}
          >
            View Payments
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Revenue Trend
            </Typography>
            <Box sx={{ height: 250 }}>
              <DashboardChart
                chartData={revenueOverview?.revenue_trend}
                isLoading={isLoading}
                height={250}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Payment Summary
            </Typography>
            {isLoading ? (
              <>
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} />
              </>
            ) : revenueOverview?.payment_summary ? (
              <Box sx={{ mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{ mb: 2, bgcolor: theme.palette.background.default }}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" color="error">
                      Overdue
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(revenueOverview.payment_summary.overdue)}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{ mb: 2, bgcolor: theme.palette.background.default }}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" color="warning.main">
                      Due Today
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(
                        revenueOverview.payment_summary.due_today
                      )}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{ bgcolor: theme.palette.background.default }}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="subtitle2" color="info.main">
                      Upcoming
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(revenueOverview.payment_summary.upcoming)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No payment summary available
              </Typography>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1, mt: 3 }}>
              Recent Payments
            </Typography>
            {isLoading ? (
              <>
                <Skeleton height={50} sx={{ mb: 1 }} />
                <Skeleton height={50} sx={{ mb: 1 }} />
                <Skeleton height={50} />
              </>
            ) : revenueOverview?.recent_payments &&
              revenueOverview.recent_payments.length > 0 ? (
              <List sx={{ width: "100%" }} dense>
                {revenueOverview.recent_payments.slice(0, 3).map((payment) => (
                  <ListItem
                    key={payment.id}
                    sx={{
                      mb: 1,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1,
                      py: 0.5,
                    }}
                    dense
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" component="div">
                          {formatCurrency(payment.amount)}
                          <Chip
                            label={payment.status}
                            size="small"
                            color={
                              payment.status === "COMPLETED"
                                ? "success"
                                : "default"
                            }
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      }
                      secondary={
                        <>
                          {payment.paid_on
                            ? format(new Date(payment.paid_on), "MMM d, yyyy")
                            : format(
                                new Date(payment.due_date),
                                "MMM d, yyyy"
                              ) + " (Due)"}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent payments
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RevenueOverviewCard;
