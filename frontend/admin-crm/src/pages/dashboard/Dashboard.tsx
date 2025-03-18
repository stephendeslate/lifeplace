// frontend/admin-crm/src/pages/dashboard/Dashboard.tsx
import {
  Assignment as AssignmentIcon,
  BarChart as ChartIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import Layout from "../../components/common/Layout";
import useAuth from "../../hooks/useAuth";

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent sx={{ display: "flex", alignItems: "center" }}>
      <Avatar
        sx={{
          backgroundColor: color,
          height: 56,
          width: 56,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ ml: 3 }}>
        <Typography color="textSecondary" gutterBottom variant="overline">
          {title}
        </Typography>
        <Typography color="textPrimary" variant="h4">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Activity item component
interface ActivityItemProps {
  title: string;
  time: string;
  description: string;
  icon: React.ReactNode;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  time,
  description,
  icon,
}) => (
  <ListItem disableGutters>
    <ListItemAvatar>
      <Avatar sx={{ backgroundColor: "background.paper" }}>{icon}</Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="subtitle2" color="textPrimary">
          {title}
        </Typography>
      }
      secondary={
        <>
          <Typography
            variant="caption"
            color="textSecondary"
            component="span"
            display="block"
          >
            {time}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="span"
            display="block"
          >
            {description}
          </Typography>
        </>
      }
    />
  </ListItem>
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      title: "New user registered",
      time: "2 hours ago",
      description: "Jane Cooper has signed up as a new user",
      icon: <PeopleIcon color="primary" />,
    },
    {
      id: 2,
      title: "Report generated",
      time: "4 hours ago",
      description: "Monthly analytics report has been generated",
      icon: <AssignmentIcon color="success" />,
    },
    {
      id: 3,
      title: "Invoice paid",
      time: "Yesterday at 3:30 PM",
      description: "Invoice #12345 has been paid",
      icon: <MoneyIcon color="info" />,
    },
  ];

  return (
    <Layout>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.first_name || "Admin"}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Here's what's happening with your admin portal today.
            </Typography>
          </Box>

          {/* Stat cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="TOTAL USERS"
                value="1,250"
                icon={<PeopleIcon />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="NEW SIGNUPS"
                value="48"
                icon={<TrendingUpIcon />}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="ACTIVE SESSIONS"
                value="324"
                icon={<ChartIcon />}
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title="SUPPORT TICKETS"
                value="8"
                icon={<AssignmentIcon />}
                color={theme.palette.warning.main}
              />
            </Grid>
          </Grid>

          {/* Dashboard content */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Growth
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your user base is growing steadily
                  </Typography>
                  <Box sx={{ height: 300, mt: 3 }}>
                    {/* Chart would go here - simulated with a placeholder box */}
                    <Box
                      sx={{
                        backgroundColor: "background.default",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        User Growth Chart
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6">Recent Activity</Typography>
                    <Button size="small" color="primary">
                      View all
                    </Button>
                  </Box>
                  <Divider />
                  <List disablePadding>
                    {recentActivities.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ActivityItem
                          title={activity.title}
                          time={activity.time}
                          description={activity.description}
                          icon={activity.icon}
                        />
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default Dashboard;
