// frontend/client-portal/src/pages/home/HomePage.tsx
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0, 8),
  textAlign: "center",
  backgroundColor: theme.palette.background.default,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  fontSize: "1.1rem",
  fontWeight: 500,
})) as typeof Button;

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
}));

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Welcome to LifePlace
          </Typography>
          <Typography
            variant="h5"
            component="p"
            color="textSecondary"
            paragraph
          >
            Manage your events and bookings with our simple client portal
          </Typography>

          {isAuthenticated ? (
            <Box mt={4}>
              <ActionButton
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/booking"
                sx={{ mr: 2 }}
              >
                Book Now
              </ActionButton>
              <ActionButton
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/profile"
              >
                Your Profile
              </ActionButton>
            </Box>
          ) : (
            <Box mt={4}>
              <ActionButton
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/register"
                sx={{ mr: 2 }}
              >
                Register Now
              </ActionButton>
              <ActionButton
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Login
              </ActionButton>
            </Box>
          )}
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          textAlign="center"
          mb={6}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid {...({ item: true, xs: 12, md: 4 } as any)}>
            <FeatureCard elevation={2}>
              <Typography
                variant="h5"
                component="h3"
                color="primary"
                gutterBottom
              >
                Easy Event Management
              </Typography>
              <Typography>
                View and manage all your upcoming events in one place
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid {...({ item: true, xs: 12, md: 4 } as any)}>
            <FeatureCard elevation={2}>
              <Typography
                variant="h5"
                component="h3"
                color="primary"
                gutterBottom
              >
                Secure Communication
              </Typography>
              <Typography>
                Safely exchange information with event planners and coordinators
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid {...({ item: true, xs: 12, md: 4 } as any)}>
            <FeatureCard elevation={2}>
              <Typography
                variant="h5"
                component="h3"
                color="primary"
                gutterBottom
              >
                Simple Payments
              </Typography>
              <Typography>
                View quotes, invoices, and make payments all in one platform
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
