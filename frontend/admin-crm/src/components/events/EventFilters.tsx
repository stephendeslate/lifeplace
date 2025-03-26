// frontend/admin-crm/src/components/events/EventFilters.tsx
import {
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  FilterAlt as FilterIcon,
  CreditCard as PaymentIcon,
  Person as PersonIcon,
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
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { useEventTypes } from "../../hooks/useEvents";
import { EventFilters as EventFiltersType } from "../../types/events.types";

interface EventFiltersProps {
  filters: EventFiltersType;
  onFilterChange: (filters: EventFiltersType) => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const { activeEventTypes, isLoadingActiveTypes } = useEventTypes();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string) => (e: any) => {
    onFilterChange({
      ...filters,
      [name]: e.target.value,
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
      delete newFilters[name as keyof EventFiltersType];
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
            placeholder="Search events..."
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
                <InputLabel id="event-type-label">Event Type</InputLabel>
                <Select
                  labelId="event-type-label"
                  value={filters.event_type || ""}
                  onChange={handleSelectChange("event_type")}
                  label="Event Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Types</MenuItem>
                  {activeEventTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={filters.status || ""}
                  onChange={handleSelectChange("status")}
                  label="Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <StatusIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="LEAD">Lead</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-status-label">
                  Payment Status
                </InputLabel>
                <Select
                  labelId="payment-status-label"
                  value={filters.payment_status || ""}
                  onChange={handleSelectChange("payment_status")}
                  label="Payment Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <PaymentIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All Payment Statuses</MenuItem>
                  <MenuItem value="UNPAID">Unpaid</MenuItem>
                  <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={
                  filters.start_date_from
                    ? new Date(filters.start_date_from)
                    : null
                }
                onChange={handleDateChange("start_date_from")}
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
                label="To Date"
                value={
                  filters.start_date_to ? new Date(filters.start_date_to) : null
                }
                onChange={handleDateChange("start_date_to")}
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
              <FormControl fullWidth size="small">
                <TextField
                  label="Client ID"
                  name="client"
                  value={filters.client || ""}
                  onChange={handleInputChange}
                  size="small"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
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
