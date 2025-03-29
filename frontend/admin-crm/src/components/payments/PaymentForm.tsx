// frontend/admin-crm/src/components/payments/PaymentForm.tsx
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import { usePaymentMethods } from "../../hooks/usePayments";
import { PaymentFormData, PaymentStatus } from "../../types/payments.types";

interface PaymentFormProps {
  initialValues: Partial<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => void;
  isSubmitting: boolean;
  editMode?: boolean;
}

interface PaymentFormErrors {
  event?: string;
  amount?: string;
  due_date?: string;
  payment_method?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  editMode = false,
}) => {
  const [formData, setFormData] =
    useState<Partial<PaymentFormData>>(initialValues);
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [dueDate, setDueDate] = useState<Date | null>(
    initialValues.due_date ? new Date(initialValues.due_date) : null
  );

  // Fetch events and payment methods
  const { events, isLoading: isLoadingEvents } = useEvents(1, {
    status: "CONFIRMED",
  });
  const { paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();

  // Update form data when initialValues change
  useEffect(() => {
    setFormData(initialValues);
    setDueDate(
      initialValues.due_date ? new Date(initialValues.due_date) : null
    );
  }, [initialValues]);

  // Handle input changes
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error when field is edited
      if (errors[name as keyof PaymentFormErrors]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  // Handle due date change
  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
    if (date) {
      setFormData({
        ...formData,
        due_date: date.toISOString(),
      });

      // Clear error
      if (errors.due_date) {
        setErrors({
          ...errors,
          due_date: undefined,
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: PaymentFormErrors = {};

    if (!formData.event) {
      validationErrors.event = "Event is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      validationErrors.amount = "Amount must be greater than zero";
    }

    if (!formData.due_date) {
      validationErrors.due_date = "Due date is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure we have all required fields before submission
    if (
      formData.event &&
      formData.amount &&
      formData.amount > 0 &&
      formData.due_date
    ) {
      // Set default status if not provided
      if (!formData.status) {
        formData.status = "PENDING";
      }

      // Submit form with complete data
      onSubmit(formData as PaymentFormData);
    }
  };

  // Status options for dropdown
  const statusOptions: { value: PaymentStatus; label: string }[] = [
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
  ];

  const isLoading = isLoadingEvents || isLoadingMethods;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        {/* Event Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.event}>
            <InputLabel id="event-label">Event</InputLabel>
            <Select
              labelId="event-label"
              id="event"
              name="event"
              value={formData.event?.toString() || ""}
              onChange={handleChange}
              label="Event"
              disabled={editMode} // Disable in edit mode
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name} ({event.client_name})
                </MenuItem>
              ))}
            </Select>
            {errors.event && <FormHelperText>{errors.event}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Payment Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            inputProps={{ step: "0.01", min: "0.01" }}
            value={formData.amount || ""}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status || "PENDING"}
              onChange={handleChange}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Due Date */}
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Due Date *"
            value={dueDate}
            onChange={handleDueDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors.due_date,
                helperText: errors.due_date,
              },
            }}
          />
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment_method"
              name="payment_method"
              value={formData.payment_method?.toString() || ""}
              onChange={handleChange}
              label="Payment Method"
            >
              <MenuItem value="">None</MenuItem>
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.nickname || method.type_display}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            value={formData.description || ""}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="notes"
            name="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        {/* Manual Payment Checkbox */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="is-manual-label">Payment Type</InputLabel>
            <Select
              labelId="is-manual-label"
              id="is_manual"
              name="is_manual"
              value={
                formData.is_manual === undefined
                  ? "false"
                  : formData.is_manual.toString()
              }
              onChange={handleChange}
              label="Payment Type"
            >
              <MenuItem value="false">Automatic</MenuItem>
              <MenuItem value="true">Manual</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Reference Number */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="reference_number"
            name="reference_number"
            label="Reference Number"
            value={formData.reference_number || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting
            ? "Saving..."
            : editMode
            ? "Update Payment"
            : "Create Payment"}
        </Button>
      </Box>
    </Box>
  );
};
