// frontend/admin-crm/src/hooks/useEventTypes.ts
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../apis/events.api";

/**
 * Hook to fetch and manage event types
 * This is a separate hook to prevent circular dependencies with workflows
 */
export const useEventTypes = () => {
  // Query to fetch event types
  const { data, isLoading, error } = useQuery({
    queryKey: ["eventTypes"],
    queryFn: () => eventsApi.getEventTypes(1, true), // Get first page of active event types
  });

  return {
    eventTypes: data?.results || [],
    isLoading,
    error,
  };
};

export default useEventTypes;
