// frontend/admin-crm/src/components/payments/PaymentList.tsx
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as CompletedIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  MoneyOff as RefundIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { Payment } from "../../types/payments.types";
import { formatCurrency } from "../../utils/formatters";
import { PaymentStatusChip } from "./PaymentStatusChip";

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  onProcess?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  isLoading,
  totalCount,
  page,
  onPageChange,
  onEdit,
  onRefund,
  onProcess,
  onDelete,
}) => {
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleActionsClick = (
    event: React.MouseEvent<HTMLElement>,
    payment: Payment
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleActionsClose = () => {
    setActionMenuAnchor(null);
    setSelectedPayment(null);
  };

  const handleEdit = () => {
    if (selectedPayment && onEdit) {
      onEdit(selectedPayment);
    }
    handleActionsClose();
  };

  const handleRefund = () => {
    if (selectedPayment && onRefund) {
      onRefund(selectedPayment);
    }
    handleActionsClose();
  };

  const handleProcess = () => {
    if (selectedPayment && onProcess) {
      onProcess(selectedPayment);
    }
    handleActionsClose();
  };

  const handleDelete = () => {
    if (selectedPayment && onDelete) {
      onDelete(selectedPayment);
    }
    handleActionsClose();
  };

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        ) : payments.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              No payments found
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment Number</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                      Due Date
                    </Box>
                  </TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell width="50px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {payment.payment_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {typeof payment.event === "object"
                        ? payment.event.name
                        : payment.event_details?.name ||
                          `Event ${payment.event}`}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusChip status={payment.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.due_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {payment.payment_method_details
                        ? payment.payment_method_details.nickname ||
                          payment.payment_method_details.type_display
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionsClick(e, payment)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isLoading && payments.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(totalCount / 10)} // Assuming 10 items per page
              page={page}
              onChange={(e, newPage) => onPageChange(newPage)}
              color="primary"
            />
          </Box>
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionsClose}
        >
          {onEdit && (
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
          )}
          {onProcess && selectedPayment?.status === "PENDING" && (
            <MenuItem onClick={handleProcess}>
              <CompletedIcon fontSize="small" sx={{ mr: 1 }} />
              Process Payment
            </MenuItem>
          )}
          {onRefund && selectedPayment?.status === "COMPLETED" && (
            <MenuItem onClick={handleRefund}>
              <RefundIcon fontSize="small" sx={{ mr: 1 }} />
              Refund
            </MenuItem>
          )}
          {onDelete && (
            <>
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
};
