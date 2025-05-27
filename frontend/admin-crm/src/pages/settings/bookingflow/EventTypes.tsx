// frontend/admin-crm/src/pages/settings/bookingflow/EventTypes.tsx
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { EventTypeDialog } from "../../../components/bookingflow";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useEventTypes } from "../../../hooks/useEventTypes";
import { EventType } from "../../../types/events.types";

const EventTypes: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [page, setPage] = useState(1);

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );

  // Use custom hook for data fetching
  const {
    eventTypes,
    totalCount,
    isLoading,
    createEventType,
    isCreating,
    updateEventType,
    isUpdating,
    deleteEventType,
    isDeleting,
  } = useEventTypes(page, searchTerm);

  // Handle event type creation
  const handleCreateEventType = (eventTypeData: any) => {
    createEventType(eventTypeData);
    setCreateDialogOpen(false);
  };

  // Handle event type update
  const handleUpdateEventType = (eventTypeData: any) => {
    if (selectedEventType) {
      updateEventType({
        id: selectedEventType.id,
        eventTypeData,
      });
      setEditDialogOpen(false);
      setSelectedEventType(null);
    }
  };

  // Handle event type deletion
  const handleDeleteEventType = () => {
    if (selectedEventType) {
      deleteEventType(selectedEventType.id);
      setDeleteDialogOpen(false);
      setSelectedEventType(null);
    }
  };

  // Filter event types based on active status
  const filteredEventTypes = eventTypes.filter(
    (et) => !showActiveOnly || et.is_active
  );

  return (
    <SettingsLayout
      title="Event Types"
      description="Manage event types for your business"
    >
      {/* Search and filters */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search event types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            }
            label="Show active only"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Event Type
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Event Types List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredEventTypes.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CategoryIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Event Types Found
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Create your first event type to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Event Type
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEventTypes.map((eventType) => (
            <Grid item xs={12} sm={6} md={4} key={eventType.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {eventType.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedEventType(eventType);
                          setEditDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedEventType(eventType);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, height: 60, overflow: "hidden" }}
                  >
                    {eventType.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={eventType.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={eventType.is_active ? "success" : "default"}
                    />
                    <Chip
                      label={`Created ${formatDistanceToNow(
                        new Date(eventType.created_at),
                        { addSuffix: true }
                      )}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Event Type Dialog */}
      <EventTypeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateEventType}
        isLoading={isCreating}
        editMode={false}
      />

      {/* Edit Event Type Dialog */}
      <EventTypeDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateEventType}
        isLoading={isUpdating}
        editMode={true}
        initialData={selectedEventType || undefined}
      />

      {/* Delete Event Type Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event Type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event type "
            {selectedEventType?.name}"? This action cannot be undone and may
            affect existing booking flows.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteEventType}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={16} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default EventTypes;
