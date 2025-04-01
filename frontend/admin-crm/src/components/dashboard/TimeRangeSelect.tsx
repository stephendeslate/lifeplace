// frontend/admin-crm/src/components/dashboard/TimeRangeSelect.tsx
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import React from "react";
import { TimeRange } from "../../types/dashboard.types";

interface TimeRangeSelectProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  sx?: SxProps<Theme>;
}

const TimeRangeSelect: React.FC<TimeRangeSelectProps> = ({
  value,
  onChange,
  sx,
}) => {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as TimeRange);
  };

  return (
    <FormControl size="small" sx={sx}>
      <InputLabel
        id="time-range-select-label"
        sx={{
          color: "rgba(255, 255, 255, 0.9)",
          "&.Mui-focused": {
            color: "white",
          },
        }}
      >
        Time Range
      </InputLabel>
      <Select
        labelId="time-range-select-label"
        id="time-range-select"
        value={value}
        label="Time Range"
        onChange={handleChange}
        sx={{
          minWidth: 150,
          color: "white",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.5)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.8)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          ".MuiSvgIcon-root": {
            color: "white",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: theme.shape.borderRadius,
              maxHeight: 300,
              mt: 0.5,
            },
          },
        }}
      >
        <MenuItem value="day">Today</MenuItem>
        <MenuItem value="week">This Week</MenuItem>
        <MenuItem value="month">This Month</MenuItem>
        <MenuItem value="quarter">This Quarter</MenuItem>
        <MenuItem value="year">This Year</MenuItem>
      </Select>
    </FormControl>
  );
};

export default TimeRangeSelect;
