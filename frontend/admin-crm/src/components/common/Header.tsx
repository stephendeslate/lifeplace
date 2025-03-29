// frontend/admin-crm/src/components/common/Header.tsx
import {
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import NotificationPanel from "../notifications/NotificationPanel";

interface HeaderProps {
  onMobileNavOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileNavOpen }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar elevation={2}>
      <Toolbar sx={{ height: 64 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMobileNavOpen}
          sx={{
            mr: 2,
            display: { lg: "none" },
          }}
        >
          <MenuIcon />
        </IconButton>

        <RouterLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography variant="h5" fontWeight="bold" color="inherit" noWrap>
            LifePlace
          </Typography>
        </RouterLink>

        <Box sx={{ flexGrow: 1 }} />

        {/* Replaced static badge with NotificationPanel component */}
        <NotificationPanel />

        <Box ml={2}>
          <Button
            color="inherit"
            startIcon={
              <Avatar
                sx={{
                  height: 32,
                  width: 32,
                  ml: 1,
                  backgroundColor: "primary.light",
                }}
                alt={user?.first_name}
              >
                {user?.first_name?.charAt(0)}
              </Avatar>
            }
            onClick={handleMenuOpen}
          >
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              {user?.first_name}
            </Typography>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { width: 200, mt: 1 },
            }}
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
