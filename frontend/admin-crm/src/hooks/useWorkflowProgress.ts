// frontend/admin-crm/src/hooks/useWorkflowProgress.ts
import { useEffect, useState } from "react";
import { Event } from "../types/events.types";
import { WorkflowStage } from "../types/workflows.types";
import { useWorkflowTemplate } from "./useWorkflows";

interface UseWorkflowProgressResult {
  currentStage: WorkflowStage | null;
  stages: WorkflowStage[];
  progress: number;
  isLoading: boolean;
  error: any;
}

export const useWorkflowProgress = (
  event: Event | null
): UseWorkflowProgressResult => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);

  // Get the workflow template and stages
  const { template, stages, isLoading, error } = useWorkflowTemplate(
    typeof event?.workflow_template === "number"
      ? event.workflow_template
      : undefined
  );

  useEffect(() => {
    // Calculate progress if we have stages and a current stage
    if (stages && stages.length > 0 && event?.current_stage) {
      // Find the current stage in the stage list
      const currentStageObj = stages.find(
        (stage) => stage.id === event.current_stage
      );
      setCurrentStage(currentStageObj || null);

      if (currentStageObj) {
        // Calculate workflow progress
        // This logic should match the backend calculation in Event.workflow_progress property
        const stageIndex = stages.findIndex(
          (stage) => stage.id === currentStageObj.id
        );
        const totalStages = stages.length;

        if (stageIndex !== -1 && totalStages > 0) {
          const calculatedProgress = ((stageIndex + 1) / totalStages) * 100;
          setProgress(calculatedProgress);
        }
      }
    } else {
      setProgress(0);
      setCurrentStage(null);
    }
  }, [stages, event?.current_stage]);

  return {
    currentStage,
    stages: stages || [],
    progress,
    isLoading,
    error,
  };
};
