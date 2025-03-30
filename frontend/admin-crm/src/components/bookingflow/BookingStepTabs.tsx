// frontend/admin-crm/src/components/bookingflow/BookingStepTabs.tsx
import {
  ShoppingCart as AddonIcon,
  CheckCircleOutline as ConfirmationIcon,
  AppRegistration as CustomIcon,
  CalendarMonth as DateIcon,
  ViewList as EventTypeIcon,
  Description as IntroIcon,
  Payments as PaymentIcon,
  ShoppingBasket as ProductIcon,
  Quiz as QuestionnaireIcon,
  Help as SummaryIcon,
} from "@mui/icons-material";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { StepType } from "../../types/bookingflow.types";

interface BookingStepTabsProps {
  currentTab: StepType;
  onChange: (tab: StepType) => void;
}

interface TabInfo {
  type: StepType;
  label: string;
  icon: React.ReactElement;
}

export const BookingStepTabs: React.FC<BookingStepTabsProps> = ({
  currentTab,
  onChange,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // Define the tabs with their icons
  const tabs: TabInfo[] = [
    {
      type: "INTRO",
      label: "Introduction",
      icon: <IntroIcon fontSize="small" />,
    },
    {
      type: "EVENT_TYPE",
      label: "Event Type",
      icon: <EventTypeIcon fontSize="small" />,
    },
    {
      type: "DATE",
      label: "Date Selection",
      icon: <DateIcon fontSize="small" />,
    },
    {
      type: "QUESTIONNAIRE",
      label: "Questionnaire",
      icon: <QuestionnaireIcon fontSize="small" />,
    },
    {
      type: "PRODUCT",
      label: "Products",
      icon: <ProductIcon fontSize="small" />,
    },
    {
      type: "ADDON",
      label: "Add-ons",
      icon: <AddonIcon fontSize="small" />,
    },
    {
      type: "SUMMARY",
      label: "Summary",
      icon: <SummaryIcon fontSize="small" />,
    },
    {
      type: "PAYMENT",
      label: "Payment",
      icon: <PaymentIcon fontSize="small" />,
    },
    {
      type: "CONFIRMATION",
      label: "Confirmation",
      icon: <ConfirmationIcon fontSize="small" />,
    },
    {
      type: "CUSTOM",
      label: "Custom",
      icon: <CustomIcon fontSize="small" />,
    },
  ];

  const handleChange = (event: React.SyntheticEvent, newValue: StepType) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={currentTab}
          onChange={handleChange}
          variant={isSmall ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          aria-label="booking flow step tabs"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.type}
              value={tab.type}
              icon={tab.icon}
              label={
                !isSmall && (
                  <Typography variant="caption">{tab.label}</Typography>
                )
              }
              iconPosition="start"
              sx={{
                minHeight: isSmall ? 48 : 64,
                py: 1.5,
                minWidth: isSmall ? "auto" : 120,
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};
