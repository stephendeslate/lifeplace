// frontend/admin-crm/src/components/notes/NotesList.tsx
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import React from "react";
import { Note } from "../../types/notes.types";

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (notes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No notes found. Add a note to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%" }}>
      {notes.map((note) => (
        <ListItem
          key={note.id}
          alignItems="flex-start"
          sx={{ px: 0, py: 1 }}
          disablePadding
        >
          <Card
            variant="outlined"
            sx={{ width: "100%", mb: 2, position: "relative" }}
          >
            <CardContent>
              {note.title && (
                <Typography variant="h6" gutterBottom>
                  {note.title}
                </Typography>
              )}
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {note.content}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {note.created_by_name || "System"} •{" "}
                    {format(new Date(note.created_at), "MMM d, yyyy")} (
                    {formatDistanceToNow(new Date(note.created_at), {
                      addSuffix: true,
                    })}
                    )
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(note)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(note.id)}
                    disabled={isDeleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </ListItem>
      ))}
    </List>
  );
};

export default NotesList;
