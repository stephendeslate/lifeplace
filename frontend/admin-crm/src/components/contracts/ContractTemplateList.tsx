// frontend/admin-crm/src/components/contracts/ContractTemplateList.tsx
import {
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { ContractTemplate } from "../../types/contracts.types";

interface ContractTemplateListProps {
  templates: ContractTemplate[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onView: (template: ContractTemplate) => void;
  onEdit: (template: ContractTemplate) => void;
  onDelete: (template: ContractTemplate) => void;
}

const ContractTemplateList: React.FC<ContractTemplateListProps> = ({
  templates,
  isLoading,
  totalCount,
  page,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  // Handle page change in pagination
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    onPageChange(newPage);
  };

  // Render placeholder when loading
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render empty state
  if (templates.length === 0) {
    return (
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 5 }}>
          <DescriptionIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Templates Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new contract template to get started
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Paper sx={{ width: "100%", mt: 2 }}>
      <TableContainer>
        <Table aria-label="contract templates table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Requires Signature</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} hover>
                <TableCell component="th" scope="row">
                  <Typography variant="body1">{template.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.description.length > 60
                      ? `${template.description.substring(0, 60)}...`
                      : template.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {template.event_type ? (
                    typeof template.event_type === "number" ? (
                      <Chip label="Specific Event Type" size="small" />
                    ) : (
                      <Chip label={template.event_type.name} size="small" />
                    )
                  ) : (
                    <Chip label="All Events" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {template.requires_signature ? (
                    <Chip label="Required" color="primary" size="small" />
                  ) : (
                    <Chip label="Optional" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(template.updated_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => onView(template)}
                      color="default"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(template)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(template)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
    </Paper>
  );
};

export default ContractTemplateList;
