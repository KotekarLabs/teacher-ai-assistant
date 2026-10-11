import { apiClient } from "./client";

export type ExportMode = "student" | "answer-key";
export type QuizExportMode = ExportMode;
export type WorksheetExportMode = ExportMode;

export async function downloadResourcePdf(
  resourceType: "lessons" | "worksheets" | "quizzes" | "homeworks",
  resourceId: string,
  mode?: ExportMode
): Promise<void> {
  const url = mode
    ? `/${resourceType}/${resourceId}/export/pdf?mode=${mode}`
    : `/${resourceType}/${resourceId}/export/pdf`;

  const response = await apiClient.get(url, {
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header if available
  let filename = `${resourceType}-${resourceId}.pdf`;
  const disposition = response.headers["content-disposition"];
  if (disposition && disposition.includes("filename=")) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "");
    }
  }

  // Create temporary link and trigger download
  const blob = new Blob([response.data], { type: "application/pdf" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
