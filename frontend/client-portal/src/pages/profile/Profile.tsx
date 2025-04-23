// frontend/client-portal/src/pages/profile/Profile.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import authApi from "../../apis/auth.api";
import { useToast } from "../../components/common/ToastProvider";
import useAuth from "../../hooks/useAuth";
import { User } from "../../types/auth.types";

const ProfileHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
}));

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingBottom: theme.spacing(8),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for profile editing
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [company, setCompany] = useState(user?.profile?.company || "");

  // Form state for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form values if canceling edit
      setFirstName(user?.first_name || "");
      setLastName(user?.last_name || "");
      setPhone(user?.profile?.phone || "");
      setCompany(user?.profile?.company || "");
    }
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUserData: Partial<User> = {
        first_name: firstName,
        last_name: lastName,
        profile: {
          phone,
          company,
        },
      };

      const updatedUser = await authApi.updateCurrentUser(updatedUserData);
      updateUser(updatedUser);
      setIsEditing(false);
      showToast("Profile updated successfully", "success");
    } catch (error) {
      showToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    let valid = true;
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
      valid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      valid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      valid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setPasswordErrors(errors);
    return valid;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});

      showToast("Password changed successfully", "success");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to change password";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Box>
      <ProfileHeader>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Profile
          </Typography>
          <Typography variant="subtitle1">
            Manage your account details and preferences
          </Typography>
        </Container>
      </ProfileHeader>

      <ProfileContainer>
        <Grid container spacing={4}>
          <Grid {...({ item: true, xs: 12, md: 3 } as any)}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    Account created on:{" "}
                    {new Date(user.date_joined).toLocaleDateString()}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to="/"
                    sx={{ mb: 1 }}
                  >
                    Home
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid {...({ item: true, xs: 12, md: 9 } as any)}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                >
                  <Tab label="Account Details" />
                  <Tab label="Change Password" />
                </Tabs>
              </Box>

              <CardContent>
                <TabPanel value={tabValue} index={0}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6">Personal Information</Typography>
                    <Button
                      variant={isEditing ? "outlined" : "contained"}
                      color={isEditing ? "error" : "primary"}
                      onClick={handleEditToggle}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing || loading}
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                    <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing || loading}
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                    <Grid {...({ item: true, xs: 12 } as any)}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user.email}
                        disabled
                        variant="filled"
                      />
                    </Grid>
                    <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing || loading}
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                    <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        disabled={!isEditing || loading}
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                  </Grid>

                  {isEditing && (
                    <Box sx={{ mt: 3, textAlign: "right" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleProfileUpdate}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <form onSubmit={handlePasswordChange}>
                    <Grid container spacing={3}>
                      <Grid {...({ item: true, xs: 12 } as any)}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          error={!!passwordErrors.currentPassword}
                          helperText={passwordErrors.currentPassword}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                        <TextField
                          fullWidth
                          label="New Password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          error={!!passwordErrors.newPassword}
                          helperText={passwordErrors.newPassword}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          error={!!passwordErrors.confirmPassword}
                          helperText={passwordErrors.confirmPassword}
                          disabled={loading}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, textAlign: "right" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? "Changing..." : "Change Password"}
                      </Button>
                    </Box>
                  </form>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </ProfileContainer>
    </Box>
  );
};

export default Profile;
