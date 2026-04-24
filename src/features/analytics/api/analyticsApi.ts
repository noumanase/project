import { apiClient } from "@shared/api";
import { Filter, Metric } from "../types";

export const fetchMetrics = async (filters: Filter): Promise<Metric[]> => {
  const response = await apiClient.get("/api/analytics/metrics", {
    params: filters,
  });
  return response.data;
};

export const fetchReports = async (): Promise<Report[]> => {
  const response = await apiClient.get("/api/analytics/reports");
  return response.data;
};

export const exportData = async (
  data: Report[],
  format: "csv" | "xlsx",
): Promise<Blob> => {
  const response = await apiClient.post(
    "/api/analytics/export",
    { data, format },
    {
      responseType: "blob",
    },
  );
  return response.data;
};
