// frontend/client-portal/src/pages/auth/Register.tsx
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RegisterWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  maxWidth: 600,
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  company?: string;
}

const RegisterPage: React.FC = () => {
  const { register, error, isLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = () => {
    let valid = true;
    const errors: FormErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
      valid = false;
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
      valid = false;
    }

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

    const profileData = {
      phone: phone || undefined,
      company: company || undefined,
    };

    await register(
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      Object.keys(profileData).length > 0 ? profileData : undefined
    );
  };

  return (
    <RegisterWrapper>
      <Container maxWidth="md">
        <RegisterCard elevation={3}>
          <LogoBox>
            <Typography variant="h4" color="primary" fontWeight="bold">
              Register for LifePlace
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Create your client account
            </Typography>
          </LogoBox>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12 } as any)}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
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
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
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
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12 } as any)}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Additional Information (Optional)
                </Typography>
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  id="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  disabled={isLoading}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
                <TextField
                  fullWidth
                  name="company"
                  label="Company"
                  id="company"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  error={!!formErrors.company}
                  helperText={formErrors.company}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </SubmitButton>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link component={RouterLink} to="/login">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Form>
        </RegisterCard>
      </Container>
    </RegisterWrapper>
  );
};

export default RegisterPage;
