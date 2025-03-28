// frontend/admin-crm/src/components/questionnaires/QuestionnaireList.tsx
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventTypeIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Questionnaire } from "../../types/questionnaires.types";

interface QuestionnaireListProps {
  questionnaires: Questionnaire[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onView: (questionnaire: Questionnaire) => void;
  onEdit: (questionnaire: Questionnaire) => void;
  onDelete: (questionnaire: Questionnaire) => void;
}

const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
  questionnaires,
  isLoading,
  totalCount,
  page,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    questionnaire: Questionnaire
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuestionnaire(questionnaire);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuestionnaire(null);
  };

  const handleView = () => {
    if (selectedQuestionnaire) {
      onView(selectedQuestionnaire);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (selectedQuestionnaire) {
      onEdit(selectedQuestionnaire);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedQuestionnaire) {
      onDelete(selectedQuestionnaire);
      handleMenuClose();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  return (
    <Paper elevation={2}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : questionnaires.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No questionnaires found.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Fields</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questionnaires.map((questionnaire) => (
                  <TableRow key={questionnaire.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {questionnaire.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {questionnaire.event_type ? (
                        <Chip
                          icon={<EventTypeIcon fontSize="small" />}
                          label={
                            typeof questionnaire.event_type === "number"
                              ? `ID: ${questionnaire.event_type}`
                              : questionnaire.event_type.name
                          }
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          All Events
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {questionnaire.fields_count || 0} fields
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          questionnaire.is_active ? (
                            <CheckIcon />
                          ) : (
                            <CloseIcon />
                          )
                        }
                        label={questionnaire.is_active ? "Active" : "Inactive"}
                        color={questionnaire.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{questionnaire.order}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, questionnaire)}
                        aria-label="more actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
          />
        </>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default QuestionnaireList;
