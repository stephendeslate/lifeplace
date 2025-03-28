// frontend/admin-crm/src/apis/questionnaires.api.ts
import {
  EventResponsesData,
  QuestionnaireField,
  QuestionnaireFormData,
  QuestionnaireResponseFormData,
} from "../types/questionnaires.types";
import api from "../utils/api";

export const questionnairesApi = {
  /**
   * Get all questionnaires with optional filtering
   */
  getQuestionnaires: async (
    page = 1,
    event_type?: number,
    is_active?: boolean,
    search?: string
  ) => {
    const params: Record<string, any> = { page };

    if (event_type) {
      params.event_type = event_type;
    }

    if (is_active !== undefined) {
      params.is_active = is_active;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get("/questionnaires/questionnaires/", {
      params,
    });
    return response.data;
  },

  /**
   * Get active questionnaires
   */
  getActiveQuestionnaires: async (page = 1) => {
    const response = await api.get("/questionnaires/questionnaires/active/", {
      params: { page },
    });
    return response.data;
  },

  /**
   * Get questionnaire by ID
   */
  getQuestionnaireById: async (id: number) => {
    const response = await api.get(`/questionnaires/questionnaires/${id}/`);
    return response.data;
  },

  /**
   * Create a new questionnaire
   */
  createQuestionnaire: async (questionnaireData: QuestionnaireFormData) => {
    const response = await api.post(
      "/questionnaires/questionnaires/",
      questionnaireData
    );
    return response.data;
  },

  /**
   * Update an existing questionnaire
   */
  updateQuestionnaire: async (
    id: number,
    questionnaireData: Partial<QuestionnaireFormData>
  ) => {
    const response = await api.patch(
      `/questionnaires/questionnaires/${id}/`,
      questionnaireData
    );
    return response.data;
  },

  /**
   * Delete a questionnaire
   */
  deleteQuestionnaire: async (id: number) => {
    await api.delete(`/questionnaires/questionnaires/${id}/`);
  },

  /**
   * Reorder questionnaires
   */
  reorderQuestionnaires: async (orderMapping: Record<string, number>) => {
    const response = await api.post("/questionnaires/questionnaires/reorder/", {
      order_mapping: orderMapping,
    });
    return response.data;
  },

  /**
   * Get fields for a questionnaire
   */
  getQuestionnaireFields: async (questionnaireId: number) => {
    const response = await api.get(
      `/questionnaires/questionnaires/${questionnaireId}/fields/`
    );
    return response.data;
  },

  /**
   * Create a new questionnaire field
   */
  createQuestionnaireField: async (fieldData: QuestionnaireField) => {
    const response = await api.post("/questionnaires/fields/", fieldData);
    return response.data;
  },

  /**
   * Update an existing questionnaire field
   */
  updateQuestionnaireField: async (
    id: number,
    fieldData: Partial<QuestionnaireField>
  ) => {
    const response = await api.patch(
      `/questionnaires/fields/${id}/`,
      fieldData
    );
    return response.data;
  },

  /**
   * Delete a questionnaire field
   */
  deleteQuestionnaireField: async (id: number) => {
    await api.delete(`/questionnaires/fields/${id}/`);
  },

  /**
   * Reorder fields within a questionnaire
   */
  reorderFields: async (
    questionnaireId: number,
    orderMapping: Record<string, number>
  ) => {
    const response = await api.post("/questionnaires/fields/reorder/", {
      questionnaire_id: questionnaireId,
      order_mapping: orderMapping,
    });
    return response.data;
  },

  /**
   * Get responses for an event
   */
  getEventResponses: async (eventId: number) => {
    const response = await api.get("/questionnaires/responses/", {
      params: { event: eventId },
    });
    return response.data;
  },

  /**
   * Create a new response
   */
  createResponse: async (responseData: QuestionnaireResponseFormData) => {
    const response = await api.post("/questionnaires/responses/", responseData);
    return response.data;
  },

  /**
   * Update an existing response
   */
  updateResponse: async (
    id: number,
    responseData: Partial<QuestionnaireResponseFormData>
  ) => {
    const response = await api.patch(
      `/questionnaires/responses/${id}/`,
      responseData
    );
    return response.data;
  },

  /**
   * Delete a response
   */
  deleteResponse: async (id: number) => {
    await api.delete(`/questionnaires/responses/${id}/`);
  },

  /**
   * Save multiple responses for an event
   */
  saveEventResponses: async (
    eventId: number,
    responses: { field: number; value: string }[]
  ) => {
    const data: EventResponsesData = {
      event: eventId,
      responses: responses,
    };
    const response = await api.post(
      "/questionnaires/responses/save_event_responses/",
      data
    );
    return response.data;
  },
};

export default questionnairesApi;
