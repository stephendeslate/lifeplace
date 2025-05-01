// frontend/admin-crm/src/components/bookingflow/steps/QuestionnaireConfigForm.tsx
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  QuestionnaireConfig,
  QuestionnaireItem,
} from "../../../types/bookingflow.types";
import { Questionnaire } from "../../../types/questionnaires.types";

interface QuestionnaireConfigFormProps {
  initialConfig?: QuestionnaireConfig;
  questionnaires: Questionnaire[];
  onSave: (config: QuestionnaireConfig) => void;
  isLoading?: boolean;
}

const QuestionnaireConfigForm: React.FC<QuestionnaireConfigFormProps> = ({
  initialConfig,
  questionnaires,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: QuestionnaireConfig = {
    title: "Questionnaire",
    description: "Please provide the following information.",
    questionnaire_items: [],
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<QuestionnaireConfig>(
    initialConfig || defaultConfig
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
    number | ""
  >("");
  const [isRequired, setIsRequired] = useState(true);

  // Update form when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle questionnaire selection
  const handleQuestionnaireChange = (e: SelectChangeEvent<number | string>) => {
    setSelectedQuestionnaire(e.target.value as number);
  };

  // Handle required checkbox
  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRequired(e.target.checked);
  };

  // Add questionnaire to the list
  const handleAddQuestionnaire = () => {
    if (selectedQuestionnaire === "") return;

    // Check if questionnaire is already in the list
    const exists = config.questionnaire_items.some((item) =>
      typeof item.questionnaire === "number"
        ? item.questionnaire === selectedQuestionnaire
        : item.questionnaire.id === selectedQuestionnaire
    );

    if (exists) {
      setErrors({
        ...errors,
        selectedQuestionnaire: "This questionnaire is already in the list",
      });
      return;
    }

    const nextOrder = config.questionnaire_items.length + 1;

    const newItem: QuestionnaireItem = {
      questionnaire: selectedQuestionnaire as number,
      order: nextOrder,
      is_required: isRequired,
    };

    setConfig({
      ...config,
      questionnaire_items: [...config.questionnaire_items, newItem],
    });

    // Reset selection
    setSelectedQuestionnaire("");
    setIsRequired(true);

    // Clear error
    if (errors.selectedQuestionnaire) {
      setErrors({
        ...errors,
        selectedQuestionnaire: "",
      });
    }
  };

  // Remove questionnaire from the list
  const handleRemoveQuestionnaire = (index: number) => {
    const newItems = [...config.questionnaire_items];
    newItems.splice(index, 1);

    // Reorder items
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setConfig({
      ...config,
      questionnaire_items: reorderedItems,
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!config.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (config.questionnaire_items.length === 0) {
      newErrors.questionnaire_items = "At least one questionnaire is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(config);
    }
  };

  // Get questionnaire name by ID
  const getQuestionnaireName = (id: number | Questionnaire): string => {
    if (typeof id === "object") {
      return id.name;
    }

    const questionnaire = questionnaires.find((q) => q.id === id);
    return questionnaire ? questionnaire.name : `Questionnaire ${id}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Questionnaire Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the questionnaires that clients will complete during the
          booking process.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={config.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={config.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Questionnaires
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Select
                      fullWidth
                      value={selectedQuestionnaire}
                      onChange={handleQuestionnaireChange}
                      error={!!errors.selectedQuestionnaire}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select a questionnaire
                      </MenuItem>
                      {questionnaires
                        .filter((q) => q.is_active)
                        .map((questionnaire) => (
                          <MenuItem
                            key={questionnaire.id}
                            value={questionnaire.id}
                          >
                            {questionnaire.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.selectedQuestionnaire && (
                      <Typography color="error" variant="caption">
                        {errors.selectedQuestionnaire}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isRequired}
                          onChange={handleRequiredChange}
                        />
                      }
                      label="Required"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddQuestionnaire}
                      disabled={selectedQuestionnaire === ""}
                      fullWidth
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {errors.questionnaire_items && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.questionnaire_items}
                </Typography>
              )}

              {config.questionnaire_items.length > 0 ? (
                <List>
                  {config.questionnaire_items.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={getQuestionnaireName(item.questionnaire)}
                        secondary={`Order: ${item.order} | ${
                          item.is_required ? "Required" : "Optional"
                        }`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveQuestionnaire(index)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  No questionnaires added yet. Add at least one questionnaire.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_required}
                    onChange={handleChange}
                    name="is_required"
                  />
                }
                label="Step is required"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_visible}
                    onChange={handleChange}
                    name="is_visible"
                  />
                }
                label="Step is visible"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireConfigForm;
