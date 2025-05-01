// frontend/client-portal/src/components/booking/QuestionnaireStep.tsx
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import React, { useEffect, useState } from "react";
import { bookingFlowApi } from "../../apis/bookingflow.api";
import {
  Questionnaire,
  QuestionnaireField,
} from "../../shared/types/questionnaires.types";
import { BookingStep } from "../../types/bookingflow.types";

interface QuestionnaireStepProps {
  step: BookingStep;
  responses: Record<number, string>;
  onResponseChange: (fieldId: number, value: string) => void;
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  step,
  responses,
  onResponseChange,
}) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!step.questionnaire_config) {
        setError("Questionnaire configuration not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const questionnaireId =
          typeof step.questionnaire_config.questionnaire === "number"
            ? step.questionnaire_config.questionnaire
            : step.questionnaire_config.questionnaire.id;

        const data = await bookingFlowApi.getQuestionnaire(questionnaireId);
        setQuestionnaire(data);
      } catch (err) {
        setError("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [step.questionnaire_config]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !questionnaire) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        <Typography>{error || "Questionnaire not found"}</Typography>
      </Box>
    );
  }

  const renderField = (field: QuestionnaireField) => {
    const value = responses[field.id] || "";
    const required =
      field.required || step.questionnaire_config?.require_all_fields;

    switch (field.type) {
      case "text":
        return (
          <TextField
            label={field.name}
            value={value}
            onChange={(e) => onResponseChange(field.id, e.target.value)}
            fullWidth
            required={required}
            margin="normal"
          />
        );

      case "number":
        return (
          <TextField
            label={field.name}
            type="number"
            value={value}
            onChange={(e) => onResponseChange(field.id, e.target.value)}
            fullWidth
            required={required}
            margin="normal"
          />
        );

      case "email":
        return (
          <TextField
            label={field.name}
            type="email"
            value={value}
            onChange={(e) => onResponseChange(field.id, e.target.value)}
            fullWidth
            required={required}
            margin="normal"
          />
        );

      case "phone":
        return (
          <TextField
            label={field.name}
            type="tel"
            value={value}
            onChange={(e) => onResponseChange(field.id, e.target.value)}
            fullWidth
            required={required}
            margin="normal"
          />
        );

      case "date":
        return (
          <Box sx={{ my: 2 }}>
            <DatePicker
              label={field.name}
              value={value ? new Date(value) : null}
              onChange={(newDate) => {
                if (newDate) {
                  const formatted = newDate.toISOString().split("T")[0];
                  onResponseChange(field.id, formatted);
                }
              }}
              sx={{ width: "100%" }}
            />
            {required && <FormHelperText>Required</FormHelperText>}
          </Box>
        );

      case "time":
        return (
          <Box sx={{ my: 2 }}>
            <TimePicker
              label={field.name}
              value={value ? new Date(`2000-01-01T${value}`) : null}
              onChange={(newTime) => {
                if (newTime) {
                  const formatted = newTime
                    .toISOString()
                    .split("T")[1]
                    .substring(0, 8);
                  onResponseChange(field.id, formatted);
                }
              }}
              sx={{ width: "100%" }}
            />
            {required && <FormHelperText>Required</FormHelperText>}
          </Box>
        );

      case "boolean":
        return (
          <FormControl component="fieldset" margin="normal" required={required}>
            <Typography variant="subtitle2">{field.name}</Typography>
            <RadioGroup
              value={value}
              onChange={(e) => onResponseChange(field.id, e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        );

      case "select":
        return (
          <FormControl fullWidth margin="normal" required={required}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onResponseChange(field.id, e.target.value)}
              label={field.name}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "multi-select":
        const selectedOptions = value ? value.split(",") : [];
        return (
          <FormControl fullWidth margin="normal" required={required}>
            <Typography variant="subtitle2">{field.name}</Typography>
            {field.options?.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      let newSelected;
                      if (e.target.checked) {
                        newSelected = [...selectedOptions, option];
                      } else {
                        newSelected = selectedOptions.filter(
                          (o) => o !== option
                        );
                      }
                      onResponseChange(field.id, newSelected.join(","));
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormControl>
        );

      default:
        return (
          <Typography color="error">
            Unsupported field type: {field.type}
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {step.name}
        </Typography>

        {step.description && (
          <Typography variant="body1" paragraph>
            {step.description}
          </Typography>
        )}

        <Grid container spacing={2}>
          {questionnaire.fields?.map((field) => (
            <Grid {...({ item: true, xs: 12, key: field.id } as any)}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>

        {step.instructions && (
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default QuestionnaireStep;
