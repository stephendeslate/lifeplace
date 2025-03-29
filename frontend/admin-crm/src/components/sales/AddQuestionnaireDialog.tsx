// frontend/admin-crm/src/components/sales/AddQuestionnaireDialog.tsx
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useState } from "react";
import { Questionnaire } from "../../types/questionnaires.types";

interface AddQuestionnaireDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedQuestionnaireIds: number[]) => void;
  availableQuestionnaires: Questionnaire[];
  currentQuestionnaireIds: number[];
  isSubmitting: boolean;
}

const AddQuestionnaireDialog: React.FC<AddQuestionnaireDialogProps> = ({
  open,
  onClose,
  onSave,
  availableQuestionnaires,
  currentQuestionnaireIds,
  isSubmitting,
}) => {
  const [selectedQuestionnaireIds, setSelectedQuestionnaireIds] = useState<
    number[]
  >([]);

  // Initialize selected questionnaires when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedQuestionnaireIds([...currentQuestionnaireIds]);
    }
  }, [open, currentQuestionnaireIds]);

  const handleToggleQuestionnaire = (questionnaireId: number) => {
    setSelectedQuestionnaireIds((prev) => {
      if (prev.includes(questionnaireId)) {
        return prev.filter((id) => id !== questionnaireId);
      } else {
        return [...prev, questionnaireId];
      }
    });
  };

  const handleSubmit = () => {
    onSave(selectedQuestionnaireIds);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Questionnaires</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <List>
            {availableQuestionnaires.map((questionnaire) => (
              <ListItem key={questionnaire.id} divider>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedQuestionnaireIds.includes(
                        questionnaire.id
                      )}
                      onChange={() =>
                        handleToggleQuestionnaire(questionnaire.id)
                      }
                    />
                  }
                  label={
                    <ListItemText
                      primary={questionnaire.name}
                      secondary={
                        questionnaire.event_type &&
                        `Event Type: ${questionnaire.event_type}`
                      }
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={16} />}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionnaireDialog;
