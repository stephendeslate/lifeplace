// frontend/admin-crm/src/components/workflows/WorkflowStageTabs.tsx
import {
  AssignmentLate as LeadIcon,
  PostAdd as PostProductionIcon,
  PhotoCamera as ProductionIcon,
} from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import React from "react";
import { StageType } from "../../types/workflows.types";

interface WorkflowStageTabsProps {
  currentTab: StageType;
  onChange: (tab: StageType) => void;
}

const WorkflowStageTabs: React.FC<WorkflowStageTabsProps> = ({
  currentTab,
  onChange,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={currentTab}
        onChange={(e, newValue) => onChange(newValue)}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label="Lead"
          value="LEAD"
          icon={<LeadIcon />}
          iconPosition="start"
        />
        <Tab
          label="Production"
          value="PRODUCTION"
          icon={<ProductionIcon />}
          iconPosition="start"
        />
        <Tab
          label="Post Production"
          value="POST_PRODUCTION"
          icon={<PostProductionIcon />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
};

export default WorkflowStageTabs;
