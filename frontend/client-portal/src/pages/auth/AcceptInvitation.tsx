// frontend/client-portal/src/pages/auth/AcceptInvitation.tsx
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authApi from "../../apis/auth.api";
import { useToast } from "../../components/common/ToastProvider";
import { setTokens, setUser } from "../../utils/storage";

const InvitationWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const InvitationCard = styled(Paper)(({ theme }) => ({
  maxWidth: 500,
  padding: theme.spacing(6),
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const Form = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const AcceptInvitation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [invitedName, setInvitedName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!id) {
        setInvitationError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        // This assumes you have a method to fetch invitation details
        const response = await fetch(`/api/users/invitations/${id}/`);
        const data = await response.json();

        if (response.ok) {
          setInvitationValid(true);
          setInvitedEmail(data.client);
          setInvitedName(data.client_name);
        } else {
          setInvitationError(
            data.detail || "This invitation is invalid or has expired"
          );
        }
      } catch (error) {
        setInvitationError(
          "Failed to verify invitation. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyInvitation();
  }, [id]);

  const validateForm = () => {
    let valid = true;
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError("");

    try {
      if (!id) {
        throw new Error("Invalid invitation ID");
      }

      const response = await authApi.acceptInvitation(id, {
        password,
        confirm_password: confirmPassword,
      });

      // Store auth data
      setTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);

      showToast("Your account has been activated successfully", "success");
      navigate("/profile");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to activate account";
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <InvitationWrapper>
        <Container maxWidth="sm">
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </Container>
      </InvitationWrapper>
    );
  }

  if (!invitationValid) {
    return (
      <InvitationWrapper>
        <Container maxWidth="sm">
          <InvitationCard elevation={3}>
            <Typography variant="h5" color="error" gutterBottom>
              Invalid Invitation
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {invitationError}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ mt: 3 }}
            >
              Return to Home
            </Button>
          </InvitationCard>
        </Container>
      </InvitationWrapper>
    );
  }

  return (
    <InvitationWrapper>
      <Container maxWidth="sm">
        <InvitationCard elevation={3}>
          <Typography
            variant="h4"
            color="primary"
            fontWeight="bold"
            gutterBottom
          >
            Activate Your Account
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Welcome, {invitedName || invitedEmail}! Set a password to activate
            your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email"
              id="email"
              value={invitedEmail}
              disabled
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={submitLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={submitLoading}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={submitLoading}
            >
              {submitLoading ? "Activating..." : "Activate Account"}
            </SubmitButton>
          </Form>
        </InvitationCard>
      </Container>
    </InvitationWrapper>
  );
};

export default AcceptInvitation;
