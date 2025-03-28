// frontend/admin-crm/src/apis/notes.api.ts
import { Note, NoteFormData, NoteResponse } from "../types/notes.types";
import api from "../utils/api";

export const notesApi = {
  /**
   * Get all notes
   */
  getNotes: async (page = 1): Promise<NoteResponse> => {
    const response = await api.get<NoteResponse>("/notes/", {
      params: { page },
    });
    return response.data;
  },

  /**
   * Get notes for a specific object
   */
  getNotesForObject: async (
    contentType: string,
    objectId: number,
    page = 1
  ): Promise<Note[]> => {
    const response = await api.get<Note[]>("/notes/for_object/", {
      params: {
        content_type: contentType,
        object_id: objectId,
        page,
      },
    });
    return response.data;
  },

  /**
   * Get note by ID
   */
  getNoteById: async (id: number): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}/`);
    return response.data;
  },

  /**
   * Create a new note
   */
  createNote: async (noteData: NoteFormData): Promise<Note> => {
    const response = await api.post<Note>("/notes/", noteData);
    return response.data;
  },

  /**
   * Update an existing note
   */
  updateNote: async (
    id: number,
    noteData: Partial<NoteFormData>
  ): Promise<Note> => {
    const response = await api.patch<Note>(`/notes/${id}/`, noteData);
    return response.data;
  },

  /**
   * Delete a note
   */
  deleteNote: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}/`);
  },
};

export default notesApi;
