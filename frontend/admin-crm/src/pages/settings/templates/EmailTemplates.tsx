// frontend/admin-crm/src/pages/settings/templates/EmailTemplates.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useEmailTemplates } from "../../../hooks/useEmailTemplates";
import {
  EmailTemplate,
  EmailTemplateFormData,
} from "../../../types/settings.types";

const EmailTemplates: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  // Form state
  const [templateForm, setTemplateForm] = useState<EmailTemplateFormData>({
    name: "",
    subject: "",
    body: "",
    attachments: [],
  });

  // Form errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    subject?: string;
    body?: string;
  }>({});

  // Get templates from hook
  const {
    templates,
    isLoadingTemplates,
    templateVariables,
    isLoadingVariables,
    createTemplate,
    isCreatingTemplate,
    updateTemplate,
    isUpdatingTemplate,
    deleteTemplate,
    isDeletingTemplate,
    previewTemplate,
    isPreviewingTemplate,
    previewData,
  } = useEmailTemplates();

  // Filtered templates
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Form handling
  const handleTemplateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTemplateForm({
      ...templateForm,
      [name]: value,
    });

    // Clear errors when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  // Form validation
  const validateTemplateForm = (): boolean => {
    const errors: typeof formErrors = {};
    let isValid = true;

    if (!templateForm.name.trim()) {
      errors.name = "Template name is required";
      isValid = false;
    }

    if (!templateForm.subject.trim()) {
      errors.subject = "Subject is required";
      isValid = false;
    }

    if (!templateForm.body.trim()) {
      errors.body = "Body is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle create template
  const handleCreateTemplate = () => {
    if (validateTemplateForm()) {
      createTemplate(templateForm);
      setCreateDialogOpen(false);
      setTemplateForm({
        name: "",
        subject: "",
        body: "",
        attachments: [],
      });
    }
  };

  // Handle edit template
  const handleEditTemplate = () => {
    if (validateTemplateForm() && selectedTemplate) {
      updateTemplate({
        id: selectedTemplate.id,
        template: templateForm,
      });
      setEditDialogOpen(false);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      deleteTemplate(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  // Handle preview template
  const handlePreviewTemplate = () => {
    if (selectedTemplate) {
      previewTemplate({
        template_id: selectedTemplate.id,
        context_data: {
          first_name: "John",
          last_name: "Doe",
          invitation_link: "https://lifeplace.com/example-link",
          invited_by: "Admin User",
          expiry_date: "7 days",
          current_date: new Date().toLocaleDateString(),
          site_name: "LifePlace",
          site_url: "https://lifeplace.com",
        },
      });
      setPreviewDialogOpen(true);
    }
  };

  // Open edit dialog
  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      attachments: template.attachments,
    });
    setEditDialogOpen(true);
  };

  // Open preview dialog
  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    handlePreviewTemplate();
  };

  // Open delete dialog
  const openDeleteDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  // Insert variable
  const insertVariable = (variable: string) => {
    const textArea = document.getElementById("body") as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = templateForm.body;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}{{${variable}}}${after}`;
      setTemplateForm({ ...templateForm, body: newText });

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        );
      }, 0);
    } else {
      // If no text area is focused, append to the end
      setTemplateForm({
        ...templateForm,
        body: `${templateForm.body}{{${variable}}}`,
      });
    }
  };

  return (
    <SettingsLayout
      title="Email Templates"
      description="Manage email templates used throughout the system"
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setTemplateForm({
              name: "",
              subject: "",
              body: "",
              attachments: [],
            });
            setFormErrors({});
            setCreateDialogOpen(true);
          }}
        >
          Create Template
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingTemplates ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No email templates found
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      {template.name}
                      {template.name === "Admin Invitation" && (
                        <Chip
                          label="System"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(template.updated_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openPreviewDialog(template)}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEditDialog(template)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(template)}
                        disabled={template.name === "Admin Invitation"}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredTemplates.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Create Template Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Email Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new email template that can be used throughout the system.
          </DialogContentText>

          <TextField
            margin="dense"
            name="name"
            label="Template Name"
            fullWidth
            value={templateForm.name}
            onChange={handleTemplateFormChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="subject"
            label="Subject"
            fullWidth
            value={templateForm.subject}
            onChange={handleTemplateFormChange}
            error={!!formErrors.subject}
            helperText={formErrors.subject}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="body"
            id="body"
            label="Body"
            multiline
            rows={10}
            fullWidth
            value={templateForm.body}
            onChange={handleTemplateFormChange}
            error={!!formErrors.body}
            helperText={
              formErrors.body ||
              "You can use variables like {{first_name}}, {{current_date}}, etc."
            }
            required
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Available Variables:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {isLoadingVariables ? (
                <CircularProgress size={20} />
              ) : (
                templateVariables &&
                Object.entries(templateVariables).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`{{${key}}}`}
                    size="small"
                    title={value}
                    onClick={() => insertVariable(key)}
                  />
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={isCreatingTemplate}
            startIcon={isCreatingTemplate && <CircularProgress size={16} />}
          >
            {isCreatingTemplate ? "Creating..." : "Create Template"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Email Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Edit the email template details.
          </DialogContentText>

          <TextField
            margin="dense"
            name="name"
            label="Template Name"
            fullWidth
            value={templateForm.name}
            onChange={handleTemplateFormChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
            disabled={selectedTemplate?.name === "Admin Invitation"}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="subject"
            label="Subject"
            fullWidth
            value={templateForm.subject}
            onChange={handleTemplateFormChange}
            error={!!formErrors.subject}
            helperText={formErrors.subject}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="body"
            id="body"
            label="Body"
            multiline
            rows={10}
            fullWidth
            value={templateForm.body}
            onChange={handleTemplateFormChange}
            error={!!formErrors.body}
            helperText={
              formErrors.body ||
              "You can use variables like {{first_name}}, {{current_date}}, etc."
            }
            required
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Available Variables:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {isLoadingVariables ? (
                <CircularProgress size={20} />
              ) : (
                templateVariables &&
                Object.entries(templateVariables).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`{{${key}}}`}
                    size="small"
                    title={value}
                    onClick={() => insertVariable(key)}
                  />
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePreviewTemplate}
            variant="outlined"
            disabled={isPreviewingTemplate}
            startIcon={<PreviewIcon />}
            sx={{ mr: 1 }}
          >
            Preview
          </Button>
          <Button
            onClick={handleEditTemplate}
            variant="contained"
            disabled={isUpdatingTemplate}
            startIcon={isUpdatingTemplate && <CircularProgress size={16} />}
          >
            {isUpdatingTemplate ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          {isPreviewingTemplate ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewData ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Subject:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="body1">{previewData.subject}</Typography>
              </Paper>

              <Typography variant="subtitle1" gutterBottom>
                Body:
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, height: 400, overflow: "auto" }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewData.body }} />
              </Paper>
            </>
          ) : (
            <Typography>No preview available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Template Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template "
            {selectedTemplate?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTemplate}
            variant="contained"
            color="error"
            disabled={isDeletingTemplate}
            startIcon={isDeletingTemplate && <CircularProgress size={16} />}
          >
            {isDeletingTemplate ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default EmailTemplates;
