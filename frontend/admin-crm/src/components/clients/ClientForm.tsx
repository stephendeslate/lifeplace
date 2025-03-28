// frontend/admin-crm/src/components/clients/ClientForm.tsx
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ClientFormData, ClientFormErrors } from "../../types/clients.types";

interface ClientFormProps {
  initialValues: ClientFormData;
  onSubmit: (values: ClientFormData) => void;
  isSubmitting: boolean;
  editMode: boolean;
  showInviteOption?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  editMode,
  showInviteOption = false,
}) => {
  const [formData, setFormData] = useState<ClientFormData>(initialValues);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  // Update form when initialValues change
  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error when field is updated
    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setErrors({
        ...errors,
        profile: {
          ...errors.profile,
          [profileField]: undefined,
        },
      });
    } else {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};
    let isValid = true;

    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    // Password validation - only validate if a password is provided
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Client Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!errors.first_name}
            helperText={errors.first_name}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting || editMode} // Email can't be changed in edit mode
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={
              editMode
                ? "New Password (leave blank to keep current)"
                : "Password (leave blank to create without account)"
            }
            name="password"
            type="password"
            value={formData.password || ""}
            onChange={handleChange}
            error={!!errors.password}
            helperText={
              errors.password ||
              (editMode
                ? ""
                : "Leave blank to create client without account access")
            }
            required={false}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Contact Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            name="profile.phone"
            value={formData.profile?.phone || ""}
            onChange={handleChange}
            error={!!errors.profile?.phone}
            helperText={errors.profile?.phone}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Company"
            name="profile.company"
            value={formData.profile?.company || ""}
            onChange={handleChange}
            error={!!errors.profile?.company}
            helperText={errors.profile?.company}
            disabled={isSubmitting}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl error={!!errors.is_active}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleChange}
                  name="is_active"
                  color="primary"
                  disabled={isSubmitting}
                />
              }
              label="Active"
            />
            {errors.is_active && (
              <FormHelperText>{errors.is_active}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Show invitation option if creating client without password */}
        {showInviteOption && !editMode && !formData.password && (
          <Grid item xs={12}>
            <FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.send_invitation || false}
                    onChange={handleChange}
                    name="send_invitation"
                    color="primary"
                    disabled={isSubmitting}
                  />
                }
                label="Send account invitation email"
              />
              <FormHelperText>
                Send an email invitation to create an account
              </FormHelperText>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
            >
              {isSubmitting
                ? "Saving..."
                : editMode
                ? "Update Client"
                : "Create Client"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientForm;
