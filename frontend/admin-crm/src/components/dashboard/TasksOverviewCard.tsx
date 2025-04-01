// frontend/admin-crm/src/components/dashboard/TasksOverviewCard.tsx
import AssignmentIcon from "@mui/icons-material/Assignment";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { TasksOverview } from "../../types/dashboard.types";

interface TasksOverviewCardProps {
  tasksOverview: TasksOverview | undefined;
  isLoading: boolean;
}

const TasksOverviewCard: React.FC<TasksOverviewCardProps> = ({
  tasksOverview,
  isLoading,
}) => {
  const theme = useTheme();

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return theme.palette.info.main;
      case "MEDIUM":
        return theme.palette.warning.light;
      case "HIGH":
        return theme.palette.warning.main;
      case "URGENT":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    if (priority === "HIGH" || priority === "URGENT") {
      return (
        <PriorityHighIcon
          fontSize="small"
          sx={{ color: getPriorityColor(priority), ml: 1 }}
        />
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader
        title="Tasks Overview"
        subheader={
          tasksOverview && !isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Completion Rate:
              </Typography>
              <Box sx={{ position: "relative", ml: 1 }}>
                <Box sx={{ width: 40, height: 40 }}>
                  <CircularProgress
                    variant="determinate"
                    value={tasksOverview.completion_rate}
                    size={40}
                    thickness={4}
                    sx={{
                      color: theme.palette.success.main,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                      fontWeight="bold"
                    >
                      {Math.round(tasksOverview.completion_rate)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : isLoading ? (
            <Skeleton width="60%" />
          ) : null
        }
        action={
          <Button
            component={Link}
            to="/events"
            size="small"
            endIcon={<AssignmentIcon />}
          >
            View Tasks
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tasks Status
              </Typography>
              {isLoading ? (
                <>
                  <Skeleton height={30} sx={{ mb: 1 }} />
                  <Skeleton height={30} sx={{ mb: 1 }} />
                  <Skeleton height={30} />
                </>
              ) : tasksOverview ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderLeft: `4px solid ${theme.palette.error.main}`,
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Overdue
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {tasksOverview.overdue_tasks}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderLeft: `4px solid ${theme.palette.warning.main}`,
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Urgent
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {tasksOverview.urgent_tasks}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderLeft: `4px solid ${theme.palette.info.main}`,
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Pending
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {tasksOverview.tasks_by_status.PENDING || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card
                      variant="outlined"
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Completed
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {tasksOverview.completed_tasks}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Upcoming Tasks
            </Typography>
            {isLoading ? (
              <>
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} sx={{ mb: 1 }} />
                <Skeleton height={60} />
              </>
            ) : tasksOverview?.upcoming_tasks &&
              tasksOverview.upcoming_tasks.length > 0 ? (
              <List sx={{ width: "100%" }} dense>
                {tasksOverview.upcoming_tasks.slice(0, 5).map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      mb: 1,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1,
                      borderLeft: `4px solid ${getPriorityColor(
                        task.priority
                      )}`,
                      py: 1.5,
                    }}
                    component={Link}
                    to={`/events/${task.event}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2">{task.title}</Typography>
                          {getPriorityIcon(task.priority)}
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            mt: 0.5,
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Due{" "}
                            {formatDistanceToNow(new Date(task.due_date), {
                              addSuffix: true,
                            })}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              bgcolor: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                              fontWeight: "medium",
                              fontSize: "0.7rem",
                              height: 20,
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {tasksOverview.upcoming_tasks.length > 5 && (
                  <Button
                    component={Link}
                    to="/events"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    variant="outlined"
                  >
                    View All Tasks
                  </Button>
                )}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming tasks
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TasksOverviewCard;
