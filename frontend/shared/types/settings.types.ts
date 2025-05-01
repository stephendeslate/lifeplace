// frontend/admin-crm/src/types/settings.types.ts

// Section and subsection types
export interface SettingsSubsection {
  id: string;
  title: string;
  path: string;
  description?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  subsections: SettingsSubsection[];
  description?: string;
}

// Email Template types
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateVariableInfo {
  [key: string]: string; // Variable name -> description
}

export interface EmailTemplateWithVariables {
  template: EmailTemplate;
  available_variables: EmailTemplateVariableInfo;
}

export interface TemplatePreviewRequest {
  template_id: number;
  context_data?: Record<string, any>;
}

export interface TemplatePreviewResponse {
  subject: string;
  body: string;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  attachments: string[];
}

export interface EmailTemplateErrors {
  name?: string;
  subject?: string;
  body?: string;
}

export interface EmailTemplatesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EmailTemplate[];
}
