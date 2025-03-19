// frontend/admin-crm/src/pages/settings/Settings.tsx
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Description as TemplateIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Icon,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";

// Settings section definition
const settingsSections = [
  {
    id: "accounts",
    title: "Accounts",
    description: "Manage users, profiles, and permissions",
    icon: AccountIcon,
    link: "/settings/accounts/my-profile",
    color: "#0a84ff",
  },
  {
    id: "templates",
    title: "Templates",
    description: "Manage email and document templates",
    icon: TemplateIcon,
    link: "/settings/templates/email-templates",
    color: "#10b981",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Configure payment methods and billing",
    icon: PaymentIcon,
    link: "/settings/payments/payment-methods",
    color: "#f59e0b",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Customize notification preferences",
    icon: NotificationsIcon,
    link: "/settings/notifications/notification-settings",
    color: "#ef4444",
  },
];

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure and customize your LifePlace admin portal
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {settingsSections.map((section) => (
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea
                    onClick={() => navigate(section.link)}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <CardContent sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            borderRadius: 2,
                            p: 1,
                            mr: 2,
                            bgcolor: `${section.color}15`, // 15% opacity
                          }}
                        >
                          <Icon
                            component={section.icon}
                            sx={{ color: section.color, fontSize: 32 }}
                          />
                        </Box>
                        <Typography variant="h6" component="div">
                          {section.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default Settings;
