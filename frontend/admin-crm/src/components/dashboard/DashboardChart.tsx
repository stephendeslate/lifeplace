// frontend/admin-crm/src/components/dashboard/DashboardChart.tsx
import { Box, Skeleton, Typography, useTheme } from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { ChartData } from "../../types/dashboard.types";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  chartData: ChartData | undefined;
  isLoading: boolean;
  height?: number;
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  chartData,
  isLoading,
  height = 300,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", height }}>
        <Skeleton variant="rectangular" width="100%" height={height} />
      </Box>
    );
  }

  if (!chartData) {
    return (
      <Box
        sx={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="textSecondary">
          No chart data available
        </Typography>
      </Box>
    );
  }

  // Default chart options with theme colors
  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      title: {
        display: !!chartData.title,
        text: chartData.title,
        color: theme.palette.text.primary,
        font: {
          family: theme.typography.fontFamily,
          size: 14,
          weight: "600",
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 8,
        boxPadding: 4,
        usePointStyle: true,
        bodyFont: {
          family: theme.typography.fontFamily,
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: "bold",
        },
      },
    },
    scales:
      chartData.chart_type !== "pie" && chartData.chart_type !== "doughnut"
        ? {
            x: {
              grid: {
                color: theme.palette.divider,
              },
              ticks: {
                color: theme.palette.text.secondary,
                font: {
                  family: theme.typography.fontFamily,
                },
              },
            },
            y: {
              grid: {
                color: theme.palette.divider,
              },
              ticks: {
                color: theme.palette.text.secondary,
                font: {
                  family: theme.typography.fontFamily,
                },
              },
              beginAtZero: true,
            },
          }
        : undefined,
  };

  // Get theme colors for datasets if not specified
  const getDefaultDatasetColors = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];
    return colors[index % colors.length];
  };

  // Ensure datasets have colors
  const enhancedDatasets = chartData.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor:
      dataset.backgroundColor ||
      (chartData.chart_type === "pie" || chartData.chart_type === "doughnut"
        ? [
            theme.palette.primary.main,
            theme.palette.primary.light,
            theme.palette.secondary.main,
            theme.palette.secondary.light,
            theme.palette.info.main,
            theme.palette.info.light,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ]
        : getDefaultDatasetColors(index) + "40"), // Add alpha for non-pie charts
    borderColor: dataset.borderColor || getDefaultDatasetColors(index),
  }));

  // Merge with any custom options
  const options = {
    ...defaultOptions,
    ...(chartData.options || {}),
  };

  // Prepare the chart data
  const data = {
    labels: chartData.labels,
    datasets: enhancedDatasets,
  };

  // Render the appropriate chart type
  const renderChart = () => {
    switch (chartData.chart_type) {
      case "line":
        return <Line data={data} options={options} />;
      case "bar":
        return <Bar data={data} options={options} />;
      case "pie":
        return <Pie data={data} options={options} />;
      case "doughnut":
        return <Doughnut data={data} options={options} />;
      case "area":
        // For area charts, we use a line chart with fill
        return (
          <Line
            data={{
              ...data,
              datasets: data.datasets.map((dataset) => ({
                ...dataset,
                fill: true,
              })),
            }}
            options={options}
          />
        );
      default:
        return <Line data={data} options={options} />;
    }
  };

  return <Box sx={{ width: "100%", height }}>{renderChart()}</Box>;
};

export default DashboardChart;
