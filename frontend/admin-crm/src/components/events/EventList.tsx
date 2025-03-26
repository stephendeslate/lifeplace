// frontend/admin-crm/src/components/events/EventList.tsx
import {
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { Event } from "../../types/events.types";

import { EventProgress } from "./EventProgress";
import { EventStatusChip } from "./EventStatusChip";
import { NextTaskChip } from "./NextTaskChip";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  isLoading,
  totalCount,
  page,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleActionsClick = (
    event: React.MouseEvent<HTMLElement>,
    eventData: Event
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleActionsClose = () => {
    setActionMenuAnchor(null);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      onEdit(selectedEvent);
    }
    handleActionsClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      onDelete(selectedEvent);
    }
    handleActionsClose();
  };

  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = format(new Date(startDate), "MMM dd, yyyy");

    if (!endDate) {
      return start;
    }

    const end = format(new Date(endDate), "MMM dd, yyyy");

    if (start === end) {
      return start;
    }

    return `${start} - ${end}`;
  };

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              No events found
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                      Event Date
                    </Box>
                  </TableCell>
                  <TableCell width="20%">Event Name</TableCell>
                  <TableCell width="15%">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CategoryIcon sx={{ mr: 1 }} fontSize="small" />
                      Event Type
                    </Box>
                  </TableCell>
                  <TableCell width="15%">Status</TableCell>
                  <TableCell width="15%">Workflow Progress</TableCell>
                  <TableCell width="15%">Next Task</TableCell>
                  <TableCell width="50px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      {formatEventDate(event.start_date, event.end_date)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {event.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.client_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.event_type_name}</TableCell>
                    <TableCell>
                      <EventStatusChip status={event.status} />
                    </TableCell>
                    <TableCell>
                      <EventProgress
                        progress={event.workflow_progress}
                        tooltip={event.current_stage_name || "No active stage"}
                      />
                    </TableCell>
                    <TableCell>
                      <NextTaskChip task={event.next_task} />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionsClick(e, event)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isLoading && events.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(totalCount / 10)} // Assuming 10 items per page
              page={page}
              onChange={(e, newPage) => onPageChange(newPage)}
              color="primary"
            />
          </Box>
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionsClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};
