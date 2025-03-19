// frontend/admin-crm/src/pages/settings/accounts/Users.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useAdminInvitations } from "../../../hooks/useAdminInvitations";
import { useAdminUsers } from "../../../hooks/useAdminUsers";
import { useEmailTemplates } from "../../../hooks/useEmailTemplates";

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      style={{ paddingTop: "16px" }}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const Users = () => {
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // State for dialogs
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteInvitationDialogOpen, setDeleteInvitationDialogOpen] =
    useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<
    string | null
  >(null);

  // Form state for new invitation
  const [inviteForm, setInviteForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Form errors
  const [formErrors, setFormErrors] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
  }>({});

  // Hooks for data fetching
  const {
    adminUsers,
    totalCount: totalUsers,
    isLoading: isLoadingUsers,
  } = useAdminUsers(page + 1, searchTerm);

  const {
    invitations,
    totalCount: totalInvitations,
    isLoading: isLoadingInvitations,
    sendInvitation,
    isSending,
    deleteInvitation,
    isDeleting,
  } = useAdminInvitations(page + 1);

  const {
    adminInvitationTemplate,
    isLoadingAdminTemplate,
    updateTemplate,
    isUpdatingTemplate,
    previewTemplate,
    previewData,
    isPreviewingTemplate,
  } = useEmailTemplates();

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    subject: "",
    body: "",
  });

  // Update template form when data is loaded
  React.useEffect(() => {
    if (adminInvitationTemplate?.template) {
      setTemplateForm({
        subject: adminInvitationTemplate.template.subject,
        body: adminInvitationTemplate.template.body,
      });
    }
  }, [adminInvitationTemplate]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle invitation form changes
  const handleInviteFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInviteForm({
      ...inviteForm,
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

  // Validate invitation form
  const validateInviteForm = (): boolean => {
    const errors: typeof formErrors = {};
    let isValid = true;

    if (!inviteForm.first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
    }

    if (!inviteForm.last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
    }

    if (!inviteForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inviteForm.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle send invitation
  const handleSendInvitation = () => {
    if (validateInviteForm()) {
      sendInvitation(inviteForm);
      setInviteDialogOpen(false);
      setInviteForm({
        first_name: "",
        last_name: "",
        email: "",
      });
    }
  };

  // Handle template form changes
  const handleTemplateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplateForm({
      ...templateForm,
      [name]: value,
    });
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (adminInvitationTemplate?.template) {
      updateTemplate({
        id: adminInvitationTemplate.template.id,
        template: {
          subject: templateForm.subject,
          body: templateForm.body,
        },
      });
      setTemplateDialogOpen(false);
    }
  };

  // Handle preview template
  const handlePreviewTemplate = () => {
    if (adminInvitationTemplate?.template) {
      previewTemplate({
        template_id: adminInvitationTemplate.template.id,
        context_data: {
          first_name: "John",
          last_name: "Doe",
          invitation_link: "https://lifeplace.com/accept-invitation/abc123",
          invited_by: "Admin User",
          expiry_date: "7 days",
        },
      });
      setPreviewDialogOpen(true);
    }
  };

  // Handle delete invitation
  const handleDeleteInvitation = () => {
    if (selectedInvitationId) {
      deleteInvitation(selectedInvitationId);
      setDeleteInvitationDialogOpen(false);
      setSelectedInvitationId(null);
    }
  };

  return (
    <SettingsLayout
      title="User Management"
      description="Manage admin users and send invitations to join your team"
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="user management tabs"
        >
          <Tab
            label="Admin Users"
            id="users-tab-0"
            aria-controls="users-tabpanel-0"
          />
          <Tab
            label="Invitations"
            id="users-tab-1"
            aria-controls="users-tabpanel-1"
          />
          <Tab
            label="Email Template"
            id="users-tab-2"
            aria-controls="users-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Admin Users Tab */}
      <TabPanel value={tabValue} index={0}>
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite Admin
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        color={user.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.date_joined), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TabPanel>

      {/* Invitations Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteDialogOpen(true)}
          >
            New Invitation
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invited</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingInvitations ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No invitations found
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      {invitation.first_name} {invitation.last_name}
                    </TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={invitation.is_accepted ? "Accepted" : "Pending"}
                        color={invitation.is_accepted ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(invitation.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(invitation.expires_at))}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={invitation.is_accepted}
                        onClick={() => {
                          // Resend invitation logic here
                        }}
                      >
                        <MailIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={invitation.is_accepted}
                        onClick={() => {
                          setSelectedInvitationId(invitation.id);
                          setDeleteInvitationDialogOpen(true);
                        }}
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
          count={totalInvitations}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TabPanel>

      {/* Email Template Tab */}
      <TabPanel value={tabValue} index={2}>
        {isLoadingAdminTemplate ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !adminInvitationTemplate ? (
          <Alert severity="error">
            Admin invitation template not found. Please contact system
            administrator.
          </Alert>
        ) : (
          <>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                Admin Invitation Email Template
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreviewTemplate}
                  sx={{ mr: 1 }}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  Edit Template
                </Button>
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Subject:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {adminInvitationTemplate.template.subject}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Body:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "background.default",
                  borderRadius: 1,
                  whiteSpace: "pre-wrap",
                }}
              >
                <Typography variant="body1">
                  {adminInvitationTemplate.template.body}
                </Typography>
              </Box>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Available Variables
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You can use these variables in your email template to
                personalize the message.
              </Typography>

              <Grid container spacing={2}>
                {Object.entries(
                  adminInvitationTemplate.available_variables
                ).map(([key, description]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <Typography variant="subtitle2" color="primary">
                        {`{{${key}}}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </TabPanel>

      {/* Invite Admin Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Admin User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details of the person you want to invite as an admin user.
          </DialogContentText>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                name="first_name"
                label="First Name"
                fullWidth
                value={inviteForm.first_name}
                onChange={handleInviteFormChange}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="last_name"
                label="Last Name"
                fullWidth
                value={inviteForm.last_name}
                onChange={handleInviteFormChange}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                value={inviteForm.email}
                onChange={handleInviteFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendInvitation}
            variant="contained"
            disabled={isSending}
            startIcon={isSending && <CircularProgress size={16} />}
          >
            {isSending ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Admin Invitation Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Customize the email template that will be sent to invited admin
            users.
          </DialogContentText>

          <TextField
            margin="dense"
            name="subject"
            label="Subject"
            fullWidth
            value={templateForm.subject}
            onChange={handleTemplateFormChange}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="body"
            label="Body"
            multiline
            rows={10}
            fullWidth
            value={templateForm.body}
            onChange={handleTemplateFormChange}
            helperText="You can use variables like {{first_name}}, {{invitation_link}}, etc."
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Available Variables:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {adminInvitationTemplate?.available_variables &&
                Object.keys(adminInvitationTemplate.available_variables).map(
                  (key) => (
                    <Chip
                      key={key}
                      label={`{{${key}}}`}
                      size="small"
                      onClick={() => {
                        // Insert variable at cursor position
                        // This is a simplified implementation
                        setTemplateForm({
                          ...templateForm,
                          body: templateForm.body + `{{${key}}}`,
                        });
                      }}
                    />
                  )
                )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePreviewTemplate}
            variant="outlined"
            disabled={isPreviewingTemplate}
          >
            Preview
          </Button>
          <Button
            onClick={handleSaveTemplate}
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

      {/* Delete Invitation Confirmation Dialog */}
      <Dialog
        open={deleteInvitationDialogOpen}
        onClose={() => setDeleteInvitationDialogOpen(false)}
      >
        <DialogTitle>Delete Invitation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invitation? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteInvitationDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteInvitation}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={16} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default Users;
