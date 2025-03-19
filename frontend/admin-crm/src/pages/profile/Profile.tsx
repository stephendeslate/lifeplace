// frontend/admin-crm/src/pages/profile/Profile.tsx
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "../../components/common/Layout";
import useAuth from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

interface ProfileProps {
  inSettingsLayout?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ inSettingsLayout = false }) => {
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    changePassword,
    isChangingPassword,
    deleteAccount,
    isDeleting,
  } = useProfile();
  const { logout } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile: {
      phone: "",
      company: "",
    },
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Error states
  const [passwordErrors, setPasswordErrors] = useState<{
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
    form?: string;
  }>({});

  // Delete account confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Set profile data when loaded
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        profile: {
          phone: profile.profile?.phone || "",
          company: profile.profile?.company || "",
        },
      });
    }
  }, [profile]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setProfileForm({
        ...profileForm,
        profile: {
          ...profileForm.profile,
          [profileField]: value,
        },
      });
    } else {
      setProfileForm({
        ...profileForm,
        [name]: value,
      });
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });

    // Clear errors when typing
    if (passwordErrors[e.target.name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.name]: undefined,
      });
    }
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors: typeof passwordErrors = {};
    let isValid = true;

    if (!passwordForm.current_password) {
      errors.current_password = "Current password is required";
      isValid = false;
    }

    if (!passwordForm.new_password) {
      errors.new_password = "New password is required";
      isValid = false;
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!passwordForm.confirm_password) {
      errors.confirm_password = "Please confirm your new password";
      isValid = false;
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePasswordForm()) {
      changePassword(passwordForm);

      // Reset form on success
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  // Handle delete account confirmation
  const handleDeleteAccount = () => {
    deleteAccount();
    setDeleteDialogOpen(false);
    // Log out the user after account deletion
    setTimeout(() => {
      logout();
    }, 2000);
  };

  // If loading, show a loading indicator
  if (isLoading) {
    if (inSettingsLayout) {
      return <Typography>Loading profile...</Typography>;
    }

    return (
      <Layout>
        <Container maxWidth="lg">
          <Box py={3}>
            <Typography>Loading profile...</Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Profile content without wrappers
  const profileContent = (
    <>
      <Toaster position="top-right" />

      {/* Profile Information */}
      <Grid item xs={12} md={inSettingsLayout ? 12 : 8}>
        <Card>
          <CardHeader title="Profile Information" />
          <Divider />
          <CardContent>
            <form onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    variant="outlined"
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="profile.phone"
                    value={profileForm.profile.phone}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="profile.company"
                    value={profileForm.profile.company}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    disabled={isUpdating}
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={
                      isUpdating ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Password Change */}
      <Grid item xs={12} md={inSettingsLayout ? 12 : 8}>
        <Card>
          <CardHeader title="Change Password" />
          <Divider />
          <CardContent>
            <form onSubmit={handlePasswordSubmit}>
              {passwordErrors.form && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordErrors.form}
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!passwordErrors.current_password}
                    helperText={passwordErrors.current_password}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!passwordErrors.new_password}
                    helperText={passwordErrors.new_password}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!passwordErrors.confirm_password}
                    helperText={passwordErrors.confirm_password}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    disabled={isChangingPassword}
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={
                      isChangingPassword ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Danger Zone */}
      <Grid item xs={12} md={inSettingsLayout ? 12 : 8}>
        <Card sx={{ backgroundColor: "#fdeded" }}>
          <CardHeader
            title="Danger Zone"
            titleTypographyProps={{ color: "error" }}
          />
          <Divider />
          <CardContent>
            <Box>
              <Typography variant="body1" gutterBottom>
                Delete your account and all of your data
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Once you delete your account, there is no going back. Please be
                certain.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                Delete Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle color="error">Are you absolutely sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete your
            account and all data associated with it.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, mb: 2 }}>
            Please type <strong>delete my account</strong> to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "delete my account" || isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // Render differently based on whether we're in a settings layout
  if (inSettingsLayout) {
    return (
      <Grid container spacing={3}>
        {profileContent}
      </Grid>
    );
  }

  // Standard layout for direct profile access
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box py={3}>
          <Typography variant="h4" gutterBottom>
            Profile Settings
          </Typography>
          <Typography color="textSecondary" paragraph>
            Manage your account settings and preferences
          </Typography>

          <Grid container spacing={3}>
            {profileContent}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default Profile;
