// frontend/admin-crm/src/hooks/useNotes.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notesApi } from "../apis/notes.api";
import { Note, NoteFormData } from "../types/notes.types";

export const useNotes = (contentType: string, objectId: number, page = 1) => {
  const queryClient = useQueryClient();

  // Query to fetch notes for an object
  const {
    data: notes,
    isLoading,
    error,
    refetch,
  } = useQuery<Note[]>({
    queryKey: ["notes", contentType, objectId, page],
    queryFn: () => notesApi.getNotesForObject(contentType, objectId, page),
  });

  // Mutation to create note
  const createNoteMutation = useMutation({
    mutationFn: (noteData: NoteFormData) => notesApi.createNote(noteData),
    onSuccess: () => {
      toast.success("Note created successfully");
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["notes", contentType, objectId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create note";
      toast.error(errorMessage);
    },
  });

  // Mutation to update note
  const updateNoteMutation = useMutation({
    mutationFn: ({
      id,
      noteData,
    }: {
      id: number;
      noteData: Partial<NoteFormData>;
    }) => notesApi.updateNote(id, noteData),
    onMutate: async ({ id, noteData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["notes", contentType, objectId],
      });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        contentType,
        objectId,
        page,
      ]);

      // Optimistically update the cache
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", contentType, objectId, page],
          previousNotes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...noteData,
                  updated_at: new Date().toISOString(),
                }
              : note
          )
        );
      }

      return { previousNotes };
    },
    onSuccess: () => {
      toast.success("Note updated successfully");
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          ["notes", contentType, objectId, page],
          context.previousNotes
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update note";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["notes", contentType, objectId],
      });
    },
  });

  // Mutation to delete note
  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => notesApi.deleteNote(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["notes", contentType, objectId],
      });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData<Note[]>([
        "notes",
        contentType,
        objectId,
        page,
      ]);

      // Optimistically remove the note
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", contentType, objectId, page],
          previousNotes.filter((note) => note.id !== id)
        );
      }

      return { previousNotes };
    },
    onSuccess: () => {
      toast.success("Note deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          ["notes", contentType, objectId, page],
          context.previousNotes
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete note";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["notes", contentType, objectId],
      });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    error,
    refetch,
    createNote: createNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    updateNote: updateNoteMutation.mutate,
    isUpdating: updateNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutate,
    isDeleting: deleteNoteMutation.isPending,
  };
};
