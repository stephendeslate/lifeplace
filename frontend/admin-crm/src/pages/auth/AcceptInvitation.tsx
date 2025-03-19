// frontend/admin-crm/src/pages/auth/AcceptInvitation.tsx
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ToastProvider from "../../components/common/ToastProvider";
import { useInvitation } from "../../hooks/useInvitation";

const AcceptInvitation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });

  const [formErrors, setFormErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);

  const {
    invitation,
    isLoadingInvitation,
    invitationError,
    isInvitationError,
    acceptInvitation,
    isAccepting,
    isAcceptSuccess,
  } = useInvitation(id || "");

  // Handle redirect after successful acceptance
  React.useEffect(() => {
    if (isAcceptSuccess) {
      // Redirect to dashboard after a short delay
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAcceptSuccess, navigate]);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    let isValid = true;
    const errors: typeof formErrors = {};

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      acceptInvitation(formData);
    }
  };

  // Check if invitation is expired - safely check if invitation exists first
  const isExpired = invitation
    ? new Date(invitation.expires_at) < new Date()
    : false;

  // Check if invitation is already accepted - safely check if invitation exists first
  const isAlreadyAccepted = invitation ? invitation.is_accepted : false;

  return (
    <ToastProvider>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Accept Invitation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your admin account to get started
              </Typography>
            </Box>

            {isLoadingInvitation ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            ) : isInvitationError ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {invitationError instanceof Error
                  ? invitationError.message
                  : "Failed to load invitation details. The invitation may be invalid."}
              </Alert>
            ) : isExpired ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                This invitation has expired. Please contact the administrator
                for a new invitation.
              </Alert>
            ) : isAlreadyAccepted ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                This invitation has already been accepted. Please log in with
                your credentials.
              </Alert>
            ) : (
              <>
                {invitation && (
                  <Box sx={{ mb: 4 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      You've been invited by{" "}
                      <strong>{invitation.invited_by}</strong> to join the admin
                      team
                    </Alert>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Name:
                      </Typography>
                      <Typography variant="body1">
                        {invitation.first_name} {invitation.last_name}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Email:
                      </Typography>
                      <Typography variant="body1">
                        {invitation.email}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Expires:
                      </Typography>
                      <Typography variant="body1">
                        {formatDistanceToNow(new Date(invitation.expires_at), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <form onSubmit={handleSubmit}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    error={!!formErrors.password}
                  >
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                    />
                    {formErrors.password && (
                      <FormHelperText error>
                        {formErrors.password}
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    error={!!formErrors.confirm_password}
                  >
                    <InputLabel htmlFor="confirm_password">
                      Confirm Password
                    </InputLabel>
                    <OutlinedInput
                      id="confirm_password"
                      name="confirm_password"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Confirm Password"
                    />
                    {formErrors.confirm_password && (
                      <FormHelperText error>
                        {formErrors.confirm_password}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {isAcceptSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Invitation accepted successfully! Redirecting to
                      dashboard...
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3 }}
                    disabled={isAccepting}
                    startIcon={
                      isAccepting ? <CircularProgress size={20} /> : null
                    }
                  >
                    {isAccepting
                      ? "Creating Account..."
                      : "Accept & Create Account"}
                  </Button>
                </form>
              </>
            )}

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Button
                  color="primary"
                  onClick={() => navigate("/login")}
                  sx={{ textTransform: "none" }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ToastProvider>
  );
};

export default AcceptInvitation;
