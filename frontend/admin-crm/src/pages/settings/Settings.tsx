// frontend/admin-crm/src/pages/settings/Settings.tsx
import {
  AccountCircle as AccountIcon,
  BookOnline as BookingFlowIcon,
  Description as ContractIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  ShoppingCart as ProductsIcon,
  QuestionAnswer as QuestionnaireIcon,
  RequestQuote as SalesIcon,
  Description as TemplateIcon,
  Assignment as WorkflowsIcon,
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
    id: "email-templates",
    title: "Email Templates",
    description: "Manage email templates",
    icon: TemplateIcon,
    link: "/settings/templates/email-templates",
    color: "#10b981",
  },
  {
    id: "products",
    title: "Products",
    description: "Manage products, packages, and discounts",
    icon: ProductsIcon,
    link: "/settings/products",
    color: "#7c3aed",
  },
  {
    id: "questionnaires",
    title: "Questionnaires",
    description: "Manage client information questionnaires",
    icon: QuestionnaireIcon,
    link: "/settings/questionnaires",
    color: "#8B5CF6",
  },
  {
    id: "contracts",
    title: "Contracts",
    description: "Manage legal contracts and templates",
    icon: ContractIcon,
    link: "/settings/contracts/templates",
    color: "#2196f3",
  },
  {
    id: "sales",
    title: "Sales",
    description: "Manage quotes and proposal templates",
    icon: SalesIcon,
    link: "/settings/sales/quote-templates",
    color: "#ef6c00",
  },
  {
    id: "workflows",
    title: "Workflows",
    description: "Manage event workflows and stages",
    icon: WorkflowsIcon,
    link: "/settings/workflows",
    color: "#f59e0b",
  },
  // Added new Booking Flow section
  {
    id: "bookingflow",
    title: "Booking Flow",
    description: "Configure client booking process and event types",
    icon: BookingFlowIcon,
    link: "/settings/bookingflow/flows",
    color: "#3b82f6", // Blue color
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
    description: "Manage notifications and preferences",
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
