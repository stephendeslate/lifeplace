// frontend/client-portal/src/pages/auth/Login.tsx
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const LoginWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  maxWidth: 480,
  padding: theme.spacing(6),
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const LogoBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  textAlign: "center",
}));

const Form = styled("form")(({ theme }) => ({
  width: "100%",
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const LoginPage: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    let valid = true;
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
      valid = false;
    }

    if (!password) {
      errors.password = "Password is required";
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

    await login(email, password, rememberMe);
  };

  return (
    <LoginWrapper>
      <Container maxWidth="sm">
        <LoginCard elevation={3}>
          <LogoBox>
            <Typography variant="h4" color="primary" fontWeight="bold">
              LifePlace Client Portal
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Sign in to access your account
            </Typography>
          </LogoBox>

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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label="Remember me"
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </SubmitButton>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link component={RouterLink} to="/register">
                  Register here
                </Link>
              </Typography>
            </Box>
          </Form>
        </LoginCard>
      </Container>
    </LoginWrapper>
  );
};

export default LoginPage;
