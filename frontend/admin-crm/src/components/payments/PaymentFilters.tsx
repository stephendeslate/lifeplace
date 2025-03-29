// frontend/admin-crm/src/components/payments/PaymentFilters.tsx
import {
  AttachMoney as AmountIcon,
  CalendarMonth as CalendarIcon,
  FilterAlt as FilterIcon,
  CreditCard as PaymentMethodIcon,
  Search as SearchIcon,
  ToggleOff as StatusIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { usePaymentGateways, usePaymentMethods } from "../../hooks/usePayments";
import { PaymentFilters as PaymentFiltersType } from "../../types/payments.types";

interface PaymentFiltersProps {
  filters: PaymentFiltersType;
  onFilterChange: (filters: PaymentFiltersType) => void;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const { activeGateways, isLoadingActive } = usePaymentGateways();
  const { paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    if (date) {
      const isoDate = date.toISOString();
      onFilterChange({
        ...filters,
        [name]: isoDate,
      });
    } else {
      // If date is cleared
      const newFilters = { ...filters };
      delete newFilters[name as keyof PaymentFiltersType];
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: filters.search, // Keep the search term
    });
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(
      ([key, value]) => key !== "search" && value !== undefined && value !== ""
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            name="search"
            value={filters.search || ""}
            onChange={handleInputChange}
            placeholder="Search payments..."
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            color={showFilters ? "primary" : "default"}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ ml: 1 }}
          >
            <FilterIcon />
          </IconButton>
        </Box>

        {hasActiveFilters() && !showFilters && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="primary">
              Filters applied
            </Typography>
            <Button
              size="small"
              sx={{ ml: 1 }}
              onClick={() => setShowFilters(true)}
            >
              Show
            </Button>
            <Button size="small" color="error" onClick={handleClearFilters}>
              Clear
            </Button>
          </Box>
        )}

        <Collapse in={showFilters}>
          <Typography variant="subtitle2" gutterBottom>
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status || ""}
                  onChange={handleSelectChange}
                  label="Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <StatusIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-method-label">
                  Payment Method
                </InputLabel>
                <Select
                  labelId="payment-method-label"
                  name="payment_method"
                  value={filters.payment_method?.toString() || ""}
                  onChange={handleSelectChange}
                  label="Payment Method"
                  startAdornment={
                    <InputAdornment position="start">
                      <PaymentMethodIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Methods</MenuItem>
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.nickname || method.type_display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.start_date ? new Date(filters.start_date) : null}
                onChange={handleDateChange("start_date")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={filters.end_date ? new Date(filters.end_date) : null}
                onChange={handleDateChange("end_date")}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Min Amount"
                name="amount_min"
                value={filters.amount_min || ""}
                onChange={handleInputChange}
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AmountIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Max Amount"
                name="amount_max"
                value={filters.amount_max || ""}
                onChange={handleInputChange}
                type="number"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AmountIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="is-manual-label">Payment Type</InputLabel>
                <Select
                  labelId="is-manual-label"
                  name="is_manual"
                  value={
                    filters.is_manual === undefined
                      ? ""
                      : filters.is_manual.toString()
                  }
                  onChange={handleSelectChange}
                  label="Payment Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="true">Manual</MenuItem>
                  <MenuItem value="false">Automatic</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};
