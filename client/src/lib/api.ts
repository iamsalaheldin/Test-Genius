import { apiRequest } from "@/lib/queryClient";

// File upload API functions
export async function uploadFiles(files: File[]): Promise<Response> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
}

export async function deleteFile(fileId: number): Promise<Response> {
  return apiRequest('DELETE', `/api/files/${fileId}`);
}

// Test case API functions
export async function generateTestCases(fileIds: number[]): Promise<Response> {
  return apiRequest('POST', '/api/test-cases/generate', { fileIds });
}

export async function updateTestCaseSelection(testCaseId: number, selected: boolean): Promise<Response> {
  return apiRequest('PATCH', `/api/test-cases/${testCaseId}/select`, { selected });
}

export async function exportTestCasesToCsv(testCaseIds: number[]): Promise<Response> {
  return apiRequest('POST', `/api/test-cases/export-csv`, { testCaseIds });
}
