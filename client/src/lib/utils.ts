import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'file-pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'file-text';
    case 'text/plain':
      return 'file-text';
    case 'text/markdown':
      return 'file-text';
    default:
      return 'file';
  }
}

export function getPriorityClassName(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTypeClassName(type: string): string {
  switch (type.toLowerCase()) {
    case 'functional':
      return 'type-functional';
    case 'non-functional':
      return 'type-non-functional';
    case 'integration':
      return 'type-integration';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
