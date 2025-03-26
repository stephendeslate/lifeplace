// frontend/admin-crm/src/pages/events/EventsList.tsx
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { EventFilters, EventList } from "../../components/events";
import { useEvents } from "../../hooks/useEvents";
import {
  Event,
  EventFilters as EventFiltersType,
} from "../../types/events.types";

export const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const { events, totalCount, isLoading, deleteEvent, isDeleting } = useEvents(
    page,
    filters
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleCreateEvent = () => {
    navigate("/events/new");
  };

  return (
    <Layout>
      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CalendarIcon
                sx={{ mr: 2, color: "primary.main", fontSize: 32 }}
              />
              <Box>
                <Typography variant="h4">Events</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Manage all client events
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateEvent}
            >
              New Event
            </Button>
          </Box>

          <EventFilters filters={filters} onFilterChange={handleFilterChange} />

          <EventList
            events={events}
            isLoading={isLoading}
            totalCount={totalCount}
            page={page}
            onPageChange={handlePageChange}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{eventToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default EventsList;
