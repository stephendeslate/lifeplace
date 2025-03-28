// frontend/admin-crm/src/components/notes/NoteForm.tsx
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NoteFormData, NoteFormErrors } from "../../types/notes.types";

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NoteFormData) => void;
  initialValues?: NoteFormData;
  isSubmitting: boolean;
  contentType?: string;
  objectId?: number;
}

const NoteForm: React.FC<NoteFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting,
  contentType,
  objectId,
}) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: "",
    content: "",
  });

  const [errors, setErrors] = useState<NoteFormErrors>({});

  // Update form when initialValues changes
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    } else {
      setFormData({
        title: "",
        content: "",
        content_type_model: contentType,
        object_id: objectId,
      });
    }
  }, [initialValues, contentType, objectId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name as keyof NoteFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: NoteFormErrors = {};
    let isValid = true;

    // Content is required
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Include contentType and objectId if they were provided
      const submitData = {
        ...formData,
        content_type_model: contentType || formData.content_type_model,
        object_id: objectId || formData.object_id,
      };

      onSubmit(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialValues ? "Edit Note" : "Add Note"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          fullWidth
          label="Title (Optional)"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Note Content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          multiline
          rows={6}
          error={!!errors.content}
          helperText={errors.content}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Saving..." : initialValues ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteForm;
