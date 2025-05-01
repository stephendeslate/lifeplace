// frontend/client-portal/src/components/booking/DateStep.tsx
import { Box, Grid, Paper, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { add, format, isAfter } from "date-fns";
import React, { useEffect, useState } from "react";
import { BookingStep } from "../../types/bookingflow.types";

interface DateStepProps {
  step: BookingStep;
  selectedDate?: string | null; // Backward compatibility
  selectedTime?: string | null; // Backward compatibility
  selectedStartDate: string | null;
  selectedStartTime: string | null;
  selectedEndDate: string | null;
  selectedEndTime: string | null;
  onDateSelect: (startDate: string, endDate: string | null) => void;
  onTimeSelect: (startTime: string, endTime: string | null) => void;
}

const DateStep: React.FC<DateStepProps> = ({
  step,
  selectedDate, // Backward compatibility
  selectedTime, // Backward compatibility
  selectedStartDate,
  selectedStartTime,
  selectedEndDate,
  selectedEndTime,
  onDateSelect,
  onTimeSelect,
}) => {
  const dateConfig = step.date_config;

  // Use legacy fields if the new ones aren't provided (backward compatibility)
  const initialStartDate = selectedStartDate || selectedDate;
  const initialStartTime = selectedStartTime || selectedTime;

  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate ? new Date(initialStartDate) : null
  );

  const [startTime, setStartTime] = useState<Date | null>(
    initialStartTime ? new Date(`2000-01-01T${initialStartTime}`) : null
  );

  const [endDate, setEndDate] = useState<Date | null>(
    selectedEndDate ? new Date(selectedEndDate) : null
  );

  const [endTime, setEndTime] = useState<Date | null>(
    selectedEndTime ? new Date(`2000-01-01T${selectedEndTime}`) : null
  );

  const [errors, setErrors] = useState<{
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  }>({});

  // Update parent component when dates/times change
  useEffect(() => {
    if (startDate && dateConfig) {
      onDateSelect(
        format(startDate, "yyyy-MM-dd"),
        dateConfig.allow_multi_day && endDate
          ? format(endDate, "yyyy-MM-dd")
          : null
      );
    }
  }, [startDate, endDate, dateConfig, onDateSelect]);

  useEffect(() => {
    if (startTime && dateConfig) {
      onTimeSelect(
        format(startTime, "HH:mm:ss"),
        dateConfig.allow_multi_day && endTime
          ? format(endTime, "HH:mm:ss")
          : null
      );
    }
  }, [startTime, endTime, dateConfig, onTimeSelect]);

  if (!dateConfig) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">
          Date configuration not found for this step.
        </Typography>
      </Box>
    );
  }

  // Handle start date change
  const handleStartDateChange = (newDate: Date | null) => {
    setStartDate(newDate);

    // Clear any errors
    setErrors((prev) => ({ ...prev, startDate: undefined }));

    // If end date is now before start date, clear it
    if (newDate && endDate && !isAfter(endDate, newDate)) {
      setEndDate(null);
      setEndTime(null);
    }
  };

  // Handle start time change
  const handleStartTimeChange = (newTime: Date | null) => {
    setStartTime(newTime);

    // Clear any errors
    setErrors((prev) => ({ ...prev, startTime: undefined }));
  };

  // Handle end date change
  const handleEndDateChange = (newDate: Date | null) => {
    if (newDate && startDate && !isAfter(newDate, startDate)) {
      setErrors((prev) => ({
        ...prev,
        endDate: "End date must be after start date",
      }));
      return;
    }

    setEndDate(newDate);
    setErrors((prev) => ({ ...prev, endDate: undefined }));
  };

  // Handle end time change
  const handleEndTimeChange = (newTime: Date | null) => {
    setEndTime(newTime);
    setErrors((prev) => ({ ...prev, endTime: undefined }));
  };

  // Calculate min and max allowed dates
  const today = new Date();
  const minDate = add(today, { days: dateConfig.min_days_in_future });
  const maxDate = add(today, { days: dateConfig.max_days_in_future });

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {step.name}
        </Typography>

        {step.description && (
          <Typography variant="body1" paragraph>
            {step.description}
          </Typography>
        )}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Start Date Section */}
          <Grid
            {...({
              item: true,
              xs: 12,
              md: dateConfig.allow_multi_day ? 6 : 12,
            } as any)}
          >
            <Typography variant="subtitle1" gutterBottom>
              {dateConfig.allow_multi_day ? "Start Date" : "Select Date"}
            </Typography>
            <DatePicker
              label={dateConfig.allow_multi_day ? "Start Date" : "Event Date"}
              value={startDate}
              onChange={handleStartDateChange}
              minDate={minDate}
              maxDate={maxDate}
              sx={{ width: "100%" }}
              slotProps={{
                textField: {
                  error: !!errors.startDate,
                  helperText: errors.startDate,
                },
              }}
            />

            {dateConfig.allow_time_selection && (
              <Box sx={{ mt: 2 }}>
                <TimePicker
                  label={
                    dateConfig.allow_multi_day ? "Start Time" : "Event Time"
                  }
                  value={startTime}
                  onChange={handleStartTimeChange}
                  disabled={!startDate}
                  sx={{ width: "100%" }}
                  slotProps={{
                    textField: {
                      error: !!errors.startTime,
                      helperText: errors.startTime,
                    },
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* End Date Section (Only shown for multi-day events) */}
          {dateConfig.allow_multi_day && (
            <Grid {...({ item: true, xs: 12, md: 6 } as any)}>
              <Typography variant="subtitle1" gutterBottom>
                End Date
              </Typography>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate || minDate}
                maxDate={maxDate}
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                  },
                }}
              />

              {dateConfig.allow_time_selection && (
                <Box sx={{ mt: 2 }}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    disabled={!endDate}
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        error: !!errors.endTime,
                        helperText: errors.endTime,
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>
          )}
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block" }}
        >
          You can select dates between {format(minDate, "PPP")} and{" "}
          {format(maxDate, "PPP")}
        </Typography>

        {(dateConfig.buffer_before_event > 0 ||
          dateConfig.buffer_after_event > 0) && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {dateConfig.buffer_before_event > 0 && (
              <>
                Buffer before event: {dateConfig.buffer_before_event} minutes
                <br />
              </>
            )}
            {dateConfig.buffer_after_event > 0 && (
              <>Buffer after event: {dateConfig.buffer_after_event} minutes</>
            )}
          </Typography>
        )}

        {step.instructions && (
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DateStep;
