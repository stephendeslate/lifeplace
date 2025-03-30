// frontend/admin-crm/src/components/settings/SettingsLayout.tsx
import {
  AccountCircle as AccountIcon,
  BookOnline as BookingFlowIcon,
  ChevronRight as ChevronRightIcon,
  Description as ContractIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  ShoppingCart as ProductsIcon,
  QuestionAnswer as QuestionnaireIcon,
  RequestQuote as SalesIcon,
  Settings as SettingsIcon,
  Description as TemplateIcon,
  Assignment as WorkflowsIcon,
} from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SettingsSection } from "../../types/settings.types";
import Layout from "../common/Layout";

// Define available settings sections
const settingsSections: SettingsSection[] = [
  {
    id: "accounts",
    title: "Accounts",
    icon: AccountIcon,
    description: "Manage users, profiles, and permissions",
    subsections: [
      {
        id: "my-profile",
        title: "My Profile",
        path: "/settings/accounts/my-profile",
        description: "Update your personal information",
      },
      {
        id: "users",
        title: "Users",
        path: "/settings/accounts/users",
        description: "Manage admin users and invitations",
      },
    ],
  },
  {
    id: "templates",
    title: "Templates",
    icon: TemplateIcon,
    description: "Manage email and document templates",
    subsections: [
      {
        id: "email-templates",
        title: "Email Templates",
        path: "/settings/templates/email-templates",
        description: "Customize notification emails",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: ProductsIcon,
    description: "Manage products, packages, and discounts",
    subsections: [
      {
        id: "products",
        title: "Products & Discounts",
        path: "/settings/products",
        description: "Manage your products, packages, and discount offerings",
      },
    ],
  },
  {
    id: "questionnaires",
    title: "Questionnaires",
    icon: QuestionnaireIcon,
    description: "Manage client information questionnaires",
    subsections: [
      {
        id: "questionnaires",
        title: "Questionnaires",
        path: "/settings/questionnaires",
        description: "Create and manage client questionnaires",
      },
    ],
  },
  {
    id: "contracts",
    title: "Contracts",
    icon: ContractIcon,
    description: "Manage legal contracts and templates",
    subsections: [
      {
        id: "contracts",
        title: "Contracts",
        path: "/settings/contracts/templates",
        description: "Create and manage client contracts",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    icon: SalesIcon,
    description: "Manage quotes and proposal templates",
    subsections: [
      {
        id: "quote-templates",
        title: "Quote Templates",
        path: "/settings/sales/quote-templates",
        description: "Create and manage quote templates",
      },
    ],
  },
  {
    id: "workflows",
    title: "Workflows",
    icon: WorkflowsIcon,
    description: "Manage event workflows and stages",
    subsections: [
      {
        id: "workflows",
        title: "Workflow Templates",
        path: "/settings/workflows",
        description: "Configure workflow templates for events",
      },
    ],
  },
  // Added new Booking Flow section
  {
    id: "bookingflow",
    title: "Booking Flow",
    icon: BookingFlowIcon,
    description: "Configure client booking process and event types",
    subsections: [
      {
        id: "flows",
        title: "Booking Flows",
        path: "/settings/bookingflow/flows",
        description: "Manage booking flows for your events",
      },
      {
        id: "event-types",
        title: "Event Types",
        path: "/settings/bookingflow/event-types",
        description: "Manage event types for your business",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: PaymentIcon,
    description: "Configure payment methods and billing",
    subsections: [
      {
        id: "payment-methods",
        title: "Payment Methods",
        path: "/settings/payments/payment-methods",
        description: "Manage payment methods and providers",
      },
      {
        id: "payment-gateways",
        title: "Payment Gateways",
        path: "/settings/payments/payment-gateways",
        description: "Configure payment processing gateways",
      },
      {
        id: "tax-rates",
        title: "Tax Rates",
        path: "/settings/payments/tax-rates",
        description: "Manage tax rates and regions",
      },
      {
        id: "billing",
        title: "Billing",
        path: "/settings/payments/billing",
        description: "View invoices and billing history",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: NotificationsIcon,
    description: "Customize notification preferences",
    subsections: [
      {
        id: "notification-settings",
        title: "Notification Preferences",
        path: "/settings/notifications/notification-settings",
        description: "Manage notification channels and frequency",
      },
      {
        id: "management",
        title: "Notification Management",
        path: "/settings/notifications/management",
        description: "View and manage notifications",
      },
      {
        id: "templates",
        title: "Notification Templates",
        path: "/settings/notifications/templates",
        description: "Customize notification content templates",
      },
    ],
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract the current section from the path
  const pathParts = location.pathname.split("/");
  const currentSectionId = pathParts[2] || "";
  const currentSubsectionId = pathParts[3] || "";

  // Find the current section and subsection
  const currentSection = settingsSections.find(
    (section) => section.id === currentSectionId
  );
  const currentSubsection = currentSection?.subsections.find(
    (subsection) => subsection.id === currentSubsectionId
  );

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const renderSideNav = () => (
    <Box>
      <Typography variant="h6" sx={{ p: 2 }}>
        Settings
      </Typography>
      <Divider />
      <List sx={{ width: "100%", maxWidth: 280 }}>
        {settingsSections.map((section) => (
          <React.Fragment key={section.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentSectionId === section.id}
                onClick={() => {
                  // Navigate to the first subsection by default
                  if (section.subsections.length > 0) {
                    navigate(section.subsections[0].path);
                  }
                  if (isMobile) {
                    setMobileDrawerOpen(false);
                  }
                }}
              >
                <ListItemIcon>
                  <section.icon
                    color={
                      currentSectionId === section.id ? "primary" : "inherit"
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={section.title}
                  secondary={section.description}
                  secondaryTypographyProps={{ noWrap: true, maxWidth: "100%" }}
                />
              </ListItemButton>
            </ListItem>

            {/* Subsection items */}
            {currentSectionId === section.id && (
              <Box sx={{ pl: 4 }}>
                {section.subsections.map((subsection) => (
                  <ListItem key={subsection.id} disablePadding>
                    <ListItemButton
                      selected={currentSubsectionId === subsection.id}
                      onClick={() => {
                        navigate(subsection.path);
                        if (isMobile) {
                          setMobileDrawerOpen(false);
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ChevronRightIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={subsection.title}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
            onClick={() => navigate("/dashboard")}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Settings
          </Link>
          {currentSection && (
            <Link
              underline="hover"
              color="inherit"
              onClick={() => {
                if (currentSection.subsections.length > 0) {
                  navigate(currentSection.subsections[0].path);
                }
              }}
            >
              {currentSection.title}
            </Link>
          )}
          {currentSubsection && (
            <Typography color="text.primary">
              {currentSubsection.title}
            </Typography>
          )}
        </Breadcrumbs>

        {/* Mobile drawer toggle */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
              }}
            >
              <Typography variant="subtitle1">Settings</Typography>
              <IconButton edge="end" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Paper>
          </Box>
        )}

        {/* Main content */}
        <Box sx={{ display: "flex" }}>
          {/* Side navigation on desktop */}
          {!isMobile && (
            <Box
              component={Paper}
              sx={{
                width: 280,
                flexShrink: 0,
                borderRadius: 1,
                height: "fit-content",
                mr: 3,
              }}
            >
              {renderSideNav()}
            </Box>
          )}

          {/* Drawer for mobile */}
          {isMobile && (
            <Drawer
              variant="temporary"
              open={mobileDrawerOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile
              }}
              sx={{
                "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
              }}
            >
              {renderSideNav()}
            </Drawer>
          )}

          {/* Content area */}
          <Box sx={{ flexGrow: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {description}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                {children}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default SettingsLayout;
