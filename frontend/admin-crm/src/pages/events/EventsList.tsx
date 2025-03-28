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
import EventForm from "../../components/events/EventForm";
import { useEvents } from "../../hooks/useEvents";
import {
  Event,
  EventFilters as EventFiltersType,
  EventFormData,
} from "../../types/events.types";

export const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    events,
    totalCount,
    isLoading,
    deleteEvent,
    isDeleting,
    createEvent,
    isCreating,
  } = useEvents(page, filters);

  // Initialize with default values for new event
  const initialEventFormData: Partial<EventFormData> = {
    name: "",
    status: "LEAD",
    start_date: new Date().toISOString(),
    // client and event_type will be selected by the user in the form
  };

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
    setCreateDialogOpen(true);
  };

  const handleSubmitNewEvent = (formData: EventFormData) => {
    createEvent(formData);
    setCreateDialogOpen(false);
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

      {/* Create Event Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <EventForm
            initialValues={initialEventFormData}
            onSubmit={handleSubmitNewEvent}
            isSubmitting={isCreating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default EventsList;
