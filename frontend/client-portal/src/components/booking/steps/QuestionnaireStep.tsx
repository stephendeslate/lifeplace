// frontend/client-portal/src/components/booking/steps/QuestionnaireStep.tsx
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import bookingClientApi from "../../../apis/booking.api";
import useClientBooking from "../../../hooks/useClientBooking";
import { QuestionnaireConfig } from "../../../types/booking.types";
import { QuestionnaireField } from "../../../types/questionnaires.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface QuestionnaireStepProps {
  config: QuestionnaireConfig;
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({ config }) => {
  const { state, addQuestionnaireResponse } = useClientBooking();
  const [questionnaires, setQuestionnaires] = useState<
    {
      id: number;
      name: string;
      fields: QuestionnaireField[];
      isRequired: boolean;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  // Fetch questionnaire data including fields
  useEffect(() => {
    if (config.questionnaire_items) {
      const fetchQuestionnaires = async () => {
        setIsLoading(true);

        try {
          // Map through questionnaire items and create an array of promises
          const questionnairePromises = config.questionnaire_items.map(
            async (item) => {
              // If it's a full object with questionnaire_details
              if (
                item.questionnaire_details &&
                typeof item.questionnaire_details === "object"
              ) {
                // Check if fields are already included
                if (item.questionnaire_details.fields) {
                  return {
                    id: item.questionnaire_details.id,
                    name: item.questionnaire_details.name,
                    fields: item.questionnaire_details.fields || [],
                    isRequired: item.is_required,
                  };
                }
              }

              // Otherwise, we need to fetch the questionnaire by ID
              const questionnaireId =
                typeof item.questionnaire === "object"
                  ? item.questionnaire.id
                  : item.questionnaire;

              try {
                // Fetch the complete questionnaire with fields
                const questionnaire =
                  await bookingClientApi.getQuestionnaireById(questionnaireId);

                // If fields are not included, fetch them separately
                let fields = questionnaire.fields || [];
                if (!fields.length) {
                  fields = await bookingClientApi.getQuestionnaireFields(
                    questionnaireId
                  );
                }

                return {
                  id: questionnaireId,
                  name: questionnaire.name,
                  fields: fields,
                  isRequired: item.is_required,
                };
              } catch (error) {
                console.error(
                  `Error fetching questionnaire ID ${questionnaireId}:`,
                  error
                );
                return {
                  id: questionnaireId,
                  name: `Questionnaire ${questionnaireId}`,
                  fields: [],
                  isRequired: item.is_required,
                };
              }
            }
          );

          // Resolve all promises
          const fetchedQuestionnaires = await Promise.all(
            questionnairePromises
          );
          setQuestionnaires(fetchedQuestionnaires);
        } catch (error) {
          console.error("Error fetching questionnaires:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuestionnaires();
    }
  }, [config.questionnaire_items]);

  // Handle field value change
  const handleFieldChange = (fieldId: number, value: string) => {
    addQuestionnaireResponse(fieldId, value);

    // Clear validation error when field is filled
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Handle select field change
  const handleSelectChange = (
    fieldId: number,
    event: SelectChangeEvent<string>
  ) => {
    handleFieldChange(fieldId, event.target.value);
  };

  // Render field based on type
  const renderField = (field: QuestionnaireField) => {
    // Get current response value
    const currentValue =
      state.formData.questionnaireResponses.find((r) => r.fieldId === field.id)
        ?.value || "";

    // Check if field has validation error
    const hasError = !!validationErrors[field.id];

    switch (field.type) {
      case "text":
        return (
          <TextField
            fullWidth
            label={field.name}
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            label={field.name}
            type="number"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
          />
        );

      case "email":
        return (
          <TextField
            fullWidth
            label={field.name}
            type="email"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
          />
        );

      case "phone":
        return (
          <TextField
            fullWidth
            label={field.name}
            type="tel"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
          />
        );

      case "date":
        return (
          <TextField
            fullWidth
            label={field.name}
            type="date"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case "time":
        return (
          <TextField
            fullWidth
            label={field.name}
            type="time"
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        );

      case "select":
        return (
          <FormControl
            fullWidth
            required={field.required}
            error={hasError}
            margin="normal"
          >
            <FormLabel>{field.name}</FormLabel>
            <Select
              value={currentValue}
              onChange={(e) => handleSelectChange(field.id, e)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an option
              </MenuItem>
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {hasError && (
              <Typography variant="caption" color="error">
                {validationErrors[field.id]}
              </Typography>
            )}
          </FormControl>
        );

      case "multi-select":
        // For multi-select, store selected values as JSON string
        const selectedValues = currentValue ? JSON.parse(currentValue) : [];

        return (
          <FormControl
            fullWidth
            required={field.required}
            error={hasError}
            margin="normal"
          >
            <FormLabel>{field.name}</FormLabel>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const newSelection = e.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter(
                              (val: string) => val !== option
                            );
                        handleFieldChange(
                          field.id,
                          JSON.stringify(newSelection)
                        );
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {hasError && (
              <Typography variant="caption" color="error">
                {validationErrors[field.id]}
              </Typography>
            )}
          </FormControl>
        );

      case "boolean":
        return (
          <FormControl
            fullWidth
            required={field.required}
            error={hasError}
            margin="normal"
          >
            <FormLabel>{field.name}</FormLabel>
            <RadioGroup
              value={currentValue}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            {hasError && (
              <Typography variant="caption" color="error">
                {validationErrors[field.id]}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.name}
            value={currentValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={hasError}
            helperText={hasError ? validationErrors[field.id] : ""}
            margin="normal"
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: 4,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading questionnaires...</Typography>
        </Box>
      ) : (
        questionnaires.map((questionnaire, index) => (
          <Accordion key={questionnaire.id} defaultExpanded={index === 0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`questionnaire-${questionnaire.id}-content`}
              id={`questionnaire-${questionnaire.id}-header`}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="subtitle1">
                  {questionnaire.name}
                </Typography>
                {questionnaire.isRequired && (
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    (Required)
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <StyledPaper>
                {questionnaire.fields && questionnaire.fields.length > 0 ? (
                  questionnaire.fields.map((field) => (
                    <Box key={field.id} sx={{ mb: 2 }}>
                      {renderField(field)}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No fields found for this questionnaire
                  </Typography>
                )}
              </StyledPaper>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {!isLoading && questionnaires.length === 0 && (
        <Typography align="center" color="text.secondary">
          No questionnaires configured for this booking flow
        </Typography>
      )}
    </Box>
  );
};

export default QuestionnaireStep;
