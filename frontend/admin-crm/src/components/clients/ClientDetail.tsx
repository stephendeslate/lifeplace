// frontend/admin-crm/src/components/clients/ClientDetail.tsx
import {
  CalendarMonth as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { Client } from "../../types/clients.types";

interface ClientDetailProps {
  client: Client;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {
  // Create initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(`${client.first_name} ${client.last_name}`);

  // Format date joined
  const formattedDateJoined = format(
    new Date(client.date_joined),
    "MMMM d, yyyy"
  );

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          {/* Client avatar and basic info */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 36,
                  mb: 2,
                  bgcolor: "primary.main",
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h5">
                {client.first_name} {client.last_name}
              </Typography>
              <Chip
                label={client.is_active ? "Active" : "Inactive"}
                color={client.is_active ? "success" : "default"}
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Client since {formattedDateJoined}
              </Typography>
            </Box>
          </Grid>

          {/* Contact information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{client.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {client.profile?.phone || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <WorkIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {client.profile?.company || "Not provided"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Joined
                  </Typography>
                  <Typography variant="body1">{formattedDateJoined}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClientDetail;
