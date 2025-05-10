// frontend/admin-crm/src/components/workflows/WorkflowProgress.tsx
import {
  AssignmentLate as LeadIcon,
  PostAdd as PostProductionIcon,
  PhotoCamera as ProductionIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { WorkflowStage } from "../../types/workflows.types";

interface WorkflowProgressProps {
  stages: WorkflowStage[];
  currentStageId: number | null;
  progress: number; // 0-100
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  stages,
  currentStageId,
  progress,
}) => {
  // Group stages by type
  const leadStages = stages
    .filter((stage) => stage.stage === "LEAD")
    .sort((a, b) => a.order - b.order);
  const productionStages = stages
    .filter((stage) => stage.stage === "PRODUCTION")
    .sort((a, b) => a.order - b.order);
  const postProductionStages = stages
    .filter((stage) => stage.stage === "POST_PRODUCTION")
    .sort((a, b) => a.order - b.order);

  // Find current stage
  const currentStage = stages.find((stage) => stage.id === currentStageId);
  const currentStageType = currentStage?.stage || "LEAD";

  // Get icon for stage type
  const getStageTypeIcon = (stageType: string) => {
    switch (stageType) {
      case "LEAD":
        return <LeadIcon />;
      case "PRODUCTION":
        return <ProductionIcon />;
      case "POST_PRODUCTION":
        return <PostProductionIcon />;
      default:
        return <LeadIcon />;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Workflow Progress</Typography>
        <Chip
          label={`${Math.round(progress)}%`}
          color="primary"
          variant={progress === 100 ? "filled" : "outlined"}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 4, mb: 3 }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Lead phase */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LeadIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Lead Phase
            </Typography>
          </Box>

          <Stepper
            activeStep={getActiveStep(leadStages, currentStageId)}
            orientation="horizontal"
          >
            {leadStages.map((stage) => (
              <Step
                key={stage.id}
                completed={isStageCompleted(stage, currentStageId, stages)}
              >
                <Tooltip title={stage.task_description || ""}>
                  <StepLabel>{stage.name}</StepLabel>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Production phase */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <ProductionIcon
              color={currentStageType === "PRODUCTION" ? "primary" : "disabled"}
              sx={{ mr: 1 }}
            />
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              color={
                currentStageType === "PRODUCTION"
                  ? "textPrimary"
                  : "textSecondary"
              }
            >
              Production Phase
            </Typography>
          </Box>

          <Stepper
            activeStep={getActiveStep(productionStages, currentStageId)}
            orientation="horizontal"
          >
            {productionStages.map((stage) => (
              <Step
                key={stage.id}
                completed={isStageCompleted(stage, currentStageId, stages)}
              >
                <Tooltip title={stage.task_description || ""}>
                  <StepLabel>{stage.name}</StepLabel>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Post-Production phase */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PostProductionIcon
              color={
                currentStageType === "POST_PRODUCTION" ? "primary" : "disabled"
              }
              sx={{ mr: 1 }}
            />
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              color={
                currentStageType === "POST_PRODUCTION"
                  ? "textPrimary"
                  : "textSecondary"
              }
            >
              Post-Production Phase
            </Typography>
          </Box>

          <Stepper
            activeStep={getActiveStep(postProductionStages, currentStageId)}
            orientation="horizontal"
          >
            {postProductionStages.map((stage) => (
              <Step
                key={stage.id}
                completed={isStageCompleted(stage, currentStageId, stages)}
              >
                <Tooltip title={stage.task_description || ""}>
                  <StepLabel>{stage.name}</StepLabel>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>
    </Paper>
  );
};

// Helper function to determine the active step index within a group
function getActiveStep(
  stageGroup: WorkflowStage[],
  currentStageId: number | null
): number {
  if (!currentStageId) return -1;

  const currentIndex = stageGroup.findIndex(
    (stage) => stage.id === currentStageId
  );
  return currentIndex >= 0 ? currentIndex : stageGroup.length;
}

// Helper function to determine if a stage is completed
function isStageCompleted(
  stage: WorkflowStage,
  currentStageId: number | null,
  allStages: WorkflowStage[]
): boolean {
  if (!currentStageId) return false;

  const currentStage = allStages.find((s) => s.id === currentStageId);
  if (!currentStage) return false;

  // Check if the stage is in an earlier phase
  if (stageTypeOrder(stage.stage) < stageTypeOrder(currentStage.stage)) {
    return true;
  }

  // If in the same phase, check order
  if (stage.stage === currentStage.stage && stage.order < currentStage.order) {
    return true;
  }

  return false;
}

// Helper function to map stage types to numeric order
function stageTypeOrder(stageType: string): number {
  switch (stageType) {
    case "LEAD":
      return 0;
    case "PRODUCTION":
      return 1;
    case "POST_PRODUCTION":
      return 2;
    default:
      return 0;
  }
}

export default WorkflowProgress;
