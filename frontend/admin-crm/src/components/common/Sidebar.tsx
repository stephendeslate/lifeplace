// frontend/admin-crm/src/components/common/Sidebar.tsx
import {
  BarChart as ChartIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  CalendarMonth as EventsIcon,
  Payment as PaymentsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

interface SidebarProps {
  onMobileClose: () => void;
  openMobile: boolean;
}

// Navigation items
const navItems = [
  {
    href: "/dashboard",
    icon: DashboardIcon,
    title: "Dashboard",
  },
  {
    href: "/events",
    icon: EventsIcon,
    title: "Events",
  },
  {
    href: "/clients",
    icon: PeopleIcon,
    title: "Clients",
  },
  {
    href: "/reports",
    icon: ChartIcon,
    title: "Reports",
  },
  {
    href: "/documents",
    icon: DocumentIcon,
    title: "Documents",
  },
  {
    href: "/payments",
    icon: PaymentsIcon,
    title: "Payments",
  },
  {
    href: "/settings",
    icon: SettingsIcon,
    title: "Settings",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onMobileClose, openMobile }) => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname, onMobileClose, openMobile]);

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Box sx={{ p: 2 }}>
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              LifePlace
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Admin Portal
            </Typography>
          </RouterLink>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {user?.role === "ADMIN" ? "Administrator" : "User"}
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.href}
                selected={item.href === location.pathname}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    "&:hover": {
                      backgroundColor: "primary.light",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button
          color="primary"
          component={RouterLink}
          to="/support"
          fullWidth
          variant="outlined"
          size="small"
        >
          Need Help?
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
          PaperProps={{
            sx: {
              width: 280,
              backgroundColor: "background.paper",
            },
          }}
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden lgDown>
        <Drawer
          anchor="left"
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: 280,
              top: 64,
              height: "calc(100% - 64px)",
              backgroundColor: "background.paper",
            },
          }}
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

export default Sidebar;
