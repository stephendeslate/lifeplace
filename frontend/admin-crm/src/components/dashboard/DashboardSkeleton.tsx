// frontend/admin-crm/src/components/dashboard/DashboardSkeleton.tsx
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
} from "@mui/material";
import React from "react";

const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Header skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="250px" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="400px" height={24} />
      </Box>

      {/* Key metrics skeleton */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={`metric-skeleton-${index}`}>
            <Card>
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
        ))}
      </Grid>

      {/* Events and Revenue overview skeletons */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Skeleton width="200px" />}
              subheader={<Skeleton width="300px" />}
            />
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Skeleton width="200px" />}
              subheader={<Skeleton width="300px" />}
            />
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Clients and Tasks overview skeletons */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Skeleton width="200px" />}
              subheader={<Skeleton width="300px" />}
            />
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Skeleton width="200px" />}
              subheader={<Skeleton width="300px" />}
            />
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent activity skeleton */}
      <Card>
        <CardHeader title={<Skeleton width="200px" />} />
        <CardContent>
          {[...Array(5)].map((_, index) => (
            <Box
              key={`activity-skeleton-${index}`}
              sx={{ display: "flex", mb: 3 }}
            >
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ mr: 2 }}
              />
              <Box sx={{ width: "100%" }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardSkeleton;
