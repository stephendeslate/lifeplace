// frontend/admin-crm/src/components/sales/AddContractTemplateDialog.tsx
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
import { ContractTemplate } from "../../types/contracts.types";

interface AddContractTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedTemplateIds: number[]) => void;
  availableTemplates: ContractTemplate[];
  currentTemplateIds: number[];
  isSubmitting: boolean;
}

const AddContractTemplateDialog: React.FC<AddContractTemplateDialogProps> = ({
  open,
  onClose,
  onSave,
  availableTemplates,
  currentTemplateIds,
  isSubmitting,
}) => {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);

  // Initialize selected templates when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedTemplateIds([...currentTemplateIds]);
    }
  }, [open, currentTemplateIds]);

  const handleToggleTemplate = (templateId: number) => {
    setSelectedTemplateIds((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((id) => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  const handleSubmit = () => {
    onSave(selectedTemplateIds);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Contract Templates</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <List>
            {availableTemplates.map((template) => (
              <ListItem key={template.id} divider>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTemplateIds.includes(template.id)}
                      onChange={() => handleToggleTemplate(template.id)}
                    />
                  }
                  label={
                    <ListItemText
                      primary={template.name}
                      secondary={template.description}
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

export default AddContractTemplateDialog;
