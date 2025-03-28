// frontend/admin-crm/src/components/notes/NotesTab.tsx
import { Add as AddIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNotes } from "../../hooks/useNotes";
import { Note, NoteFormData } from "../../types/notes.types";
import NoteForm from "./NoteForm";
import NotesList from "./NotesList";

interface NotesTabProps {
  contentType: string;
  objectId: number;
}

const NotesTab: React.FC<NotesTabProps> = ({ contentType, objectId }) => {
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const {
    notes,
    isLoading,
    createNote,
    isCreating,
    updateNote,
    isUpdating,
    deleteNote,
    isDeleting,
  } = useNotes(contentType, objectId);

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteFormOpen(true);
  };

  const handleDeleteNote = (id: number) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete !== null) {
      deleteNote(noteToDelete);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleSubmitNote = (data: NoteFormData) => {
    if (editingNote) {
      // Update existing note
      updateNote({
        id: editingNote.id,
        noteData: { title: data.title, content: data.content },
      });
    } else {
      // Create new note
      createNote({
        title: data.title,
        content: data.content,
        content_type_model: contentType,
        object_id: objectId,
      });
    }
    setNoteFormOpen(false);
    setEditingNote(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Notes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <NotesList
          notes={notes}
          isLoading={isLoading}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          isDeleting={isDeleting}
        />

        {notes.length === 0 && !isLoading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No notes have been added yet. Click "Add Note" to create the first
            note.
          </Alert>
        )}
      </Paper>

      {/* Note Form Dialog */}
      <NoteForm
        open={noteFormOpen}
        onClose={() => setNoteFormOpen(false)}
        onSubmit={handleSubmitNote}
        initialValues={
          editingNote
            ? {
                title: editingNote.title,
                content: editingNote.content,
              }
            : undefined
        }
        isSubmitting={isCreating || isUpdating}
        contentType={contentType}
        objectId={objectId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteNote}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesTab;
