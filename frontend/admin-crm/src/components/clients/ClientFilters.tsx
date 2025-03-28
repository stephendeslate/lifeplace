// frontend/admin-crm/src/components/clients/ClientFilters.tsx
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ClientFilters as ClientFiltersType } from "../../types/clients.types";

interface ClientFiltersProps {
  filters: ClientFiltersType;
  onFilterChange: (filters: ClientFiltersType) => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState<ClientFiltersType>(filters);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update local state immediately
    setLocalFilters((prev) => ({
      ...prev,
      search: value,
    }));

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounce
    const timeout = setTimeout(() => {
      onFilterChange({
        ...localFilters,
        search: value,
      });
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handle active filter change
  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setLocalFilters((prev) => ({
      ...prev,
      is_active: value,
    }));
    onFilterChange({
      ...localFilters,
      is_active: value,
    });
  };

  // Handle account filter change
  const handleAccountFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.checked;
    setLocalFilters((prev) => ({
      ...prev,
      has_account: value,
    }));
    onFilterChange({
      ...localFilters,
      has_account: value,
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <TextField
          size="small"
          placeholder="Search clients..."
          value={localFilters.search || ""}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={localFilters.is_active || false}
                onChange={handleActiveFilterChange}
                name="is_active"
              />
            }
            label="Active Only"
          />
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={localFilters.has_account || false}
                onChange={handleAccountFilterChange}
                name="has_account"
              />
            }
            label="Has Account"
          />
        </FormControl>
      </Box>
    </Paper>
  );
};

export default ClientFilters;
