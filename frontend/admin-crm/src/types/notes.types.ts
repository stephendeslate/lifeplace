// frontend/admin-crm/src/types/notes.types.ts

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Note model
export interface Note {
  id: number;
  title: string;
  content: string;
  created_by: number | null;
  created_by_name: string | null;
  content_type: number;
  content_type_name: string;
  object_id: number;
  content_object_repr: string;
  created_at: string;
  updated_at: string;
}

export interface NoteResponse extends PaginationResponse<Note> {}

// Note creation/update data
export interface NoteFormData {
  title: string;
  content: string;
  content_type_model?: string;
  object_id?: number;
}

export interface NoteFormErrors {
  title?: string;
  content?: string;
  content_type_model?: string;
  object_id?: string;
}
