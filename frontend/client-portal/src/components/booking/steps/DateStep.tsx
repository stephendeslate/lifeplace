// frontend/client-portal/src/components/booking/steps/DateStep.tsx
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  styled,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { addDays } from "date-fns";
import React, { useState } from "react";
import useClientBooking from "../../../hooks/useClientBooking";
import { DateConfig } from "../../../types/booking.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface DateStepProps {
  config: DateConfig;
}

const DateStep: React.FC<DateStepProps> = ({ config }) => {
  const { state, setDate, setTime } = useClientBooking();
  const [validationErrors, setValidationErrors] = useState<{
    date?: string;
    time?: string;
  }>({});

  const now = new Date();
  const minDate = addDays(now, config.min_days_in_future);
  const maxDate = addDays(now, config.max_days_in_future);

  // Basic time slots
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDate(date);
      // Reset validation error
      setValidationErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  // Handle time selection
  const handleTimeChange = (event: SelectChangeEvent<string>) => {
    const time = event.target.value;
    setTime(time);
    // Reset validation error
    setValidationErrors((prev) => ({ ...prev, time: undefined }));
  };

  // Format the time options for display
  const formatTimeForDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      <StyledPaper>
        <Grid container spacing={3}>
          {/* Date Selection */}
          <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
            <DatePicker
              label="Date"
              value={state.formData.startDate}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!validationErrors.date,
                  helperText: validationErrors.date,
                },
              }}
            />
          </Grid>

          {/* Time Selection */}
          {config.allow_time_selection && (
            <Grid {...({ item: true, xs: 12, sm: 6 } as any)}>
              <FormControl fullWidth error={!!validationErrors.time}>
                <InputLabel id="time-select-label">Time</InputLabel>
                <Select
                  labelId="time-select-label"
                  value={state.formData.startTime || ""}
                  onChange={handleTimeChange}
                  label="Time"
                  disabled={!state.formData.startDate}
                >
                  <MenuItem value="" disabled>
                    Select a time
                  </MenuItem>
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {formatTimeForDisplay(time)}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.time && (
                  <FormHelperText>{validationErrors.time}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}
        </Grid>
      </StyledPaper>
    </Box>
  );
};

export default DateStep;
