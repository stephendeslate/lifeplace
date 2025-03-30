// frontend/admin-crm/src/pages/events/EventsCalendar.tsx
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useEvents } from "../../hooks/useEvents";
import { Event, EventStatus } from "../../types/events.types";

// Helper function to get color based on event status
const getStatusColor = (status: EventStatus): string => {
  switch (status) {
    case "LEAD":
      return "#3498db"; // Blue
    case "CONFIRMED":
      return "#2ecc71"; // Green
    case "COMPLETED":
      return "#9b59b6"; // Purple
    case "CANCELLED":
      return "#e74c3c"; // Red
    default:
      return "#7f8c8d"; // Gray
  }
};

export const EventsCalendar: React.FC = () => {
  const navigate = useNavigate();
  // Fetch all events without pagination for calendar display
  const { events, isLoading, error } = useEvents(1, {});

  // Format events for FullCalendar
  const calendarEvents = useMemo(() => {
    return events.map((event: Event) => ({
      id: event.id.toString(),
      title: event.name,
      start: event.start_date,
      end: event.end_date || undefined,
      backgroundColor: getStatusColor(event.status),
      borderColor: getStatusColor(event.status),
      textColor: "#ffffff",
      extendedProps: {
        status: event.status,
        client: event.client_name,
        type: event.event_type_name,
      },
    }));
  }, [events]);

  // Handle event click
  const handleEventClick = (info: any) => {
    navigate(`/events/${info.event.id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Typography color="error">
              Error loading events. Please try again later.
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" gutterBottom>
            Event Calendar
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            View and manage all events in calendar format
          </Typography>

          <Paper sx={{ mt: 3, p: 2 }}>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: "short",
              }}
              eventContent={(eventInfo) => (
                <Box>
                  <Typography variant="body2" fontWeight="bold" noWrap>
                    {eventInfo.event.title}
                  </Typography>
                  <Typography variant="caption" display="block" noWrap>
                    {eventInfo.event.extendedProps.client}
                  </Typography>
                </Box>
              )}
            />
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Legend
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              {Object.entries({
                LEAD: "Lead",
                CONFIRMED: "Confirmed",
                COMPLETED: "Completed",
                CANCELLED: "Cancelled",
              }).map(([status, label]) => (
                <Box
                  key={status}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      backgroundColor: getStatusColor(status as EventStatus),
                    }}
                  />
                  <Typography variant="body2">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default EventsCalendar;
