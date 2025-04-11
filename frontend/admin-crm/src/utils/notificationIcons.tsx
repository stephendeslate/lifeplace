// frontend/admin-crm/src/utils/notificationIcons.tsx
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Task as TaskIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import React from "react";

/**
 * Maps string icon names from the database to Material-UI icon components
 * This allows us to use the more visually appealing direct component imports
 * while maintaining the database-driven flexibility
 */
export const getNotificationIcon = (iconName: string | undefined) => {
  // Default icon if none is provided
  if (!iconName) return <NotificationsIcon />;

  // Map string names to actual components
  switch (iconName.toLowerCase()) {
    // System icons
    case "notifications":
      return <NotificationsIcon />;
    case "settings":
      return <SettingsIcon />;
    case "warning":
      return <WarningIcon />;

    // Event icons
    case "event":
    case "event_available":
      return <EventIcon />;
    case "calendar":
    case "calendar_today":
      return <CalendarIcon />;
    case "schedule":
      return <ScheduleIcon />;

    // Task icons
    case "assignment":
    case "task":
      return <TaskIcon />;
    case "check_circle":
    case "task_completed":
      return <CheckCircleIcon />;

    // Payment icons
    case "payment":
      return <PaymentIcon />;
    case "attach_money":
    case "payment_received":
      return <AttachMoneyIcon />;
    case "receipt":
    case "invoice":
      return <ReceiptIcon />;

    // Client icons
    case "person":
    case "client":
      return <PersonIcon />;
    case "email":
    case "message":
      return <EmailIcon />;

    // Document icons
    case "description":
    case "contract":
    case "document":
      return <DescriptionIcon />;

    // Product icons
    case "shopping_cart":
    case "product":
      return <ShoppingCartIcon />;

    // Default fallback
    default:
      return <NotificationsIcon />;
  }
};

/**
 * Get styled icon with background and color
 */
export const getStyledNotificationIcon = (
  iconName: string | undefined,
  color: string | undefined,
  size: "small" | "medium" | "large" = "medium"
) => {
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  // Clone the icon with color prop
  const icon = React.cloneElement(getNotificationIcon(iconName), {
    style: { color: color || "#2196f3", fontSize: iconSizes[size] },
  });

  return icon;
};
