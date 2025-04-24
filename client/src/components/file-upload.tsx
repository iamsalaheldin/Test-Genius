import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle } from "lucide-react";
import { uploadFiles } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { File } from "@shared/schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
];

interface FileUploadProps {
  onUploadSuccess: (files: File[]) => void;
  className?: string;
}

export function FileUpload({ onUploadSuccess, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        invalidFiles.push({
          file,
          reason: 'File type not supported. Please upload PDF, DOCX, TXT, or MD files.'
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          file,
          reason: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
        });
        return;
      }

      validFiles.push(file);
    });

    // Show toast for invalid files
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files detected",
        description: (
          <div className="mt-2">
            {invalidFiles.map((item, index) => (
              <p key={index} className="text-sm flex items-start mb-1">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 text-destructive flex-shrink-0" />
                <span>{item.file.name}: {item.reason}</span>
              </p>
            ))}
          </div>
        ),
        variant: "destructive",
      });
    }

    return validFiles;
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (event.dataTransfer.files.length > 0) {
      await handleFileUpload(event.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await handleFileUpload(event.target.files);
      // Reset input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const validFiles = validateFiles(Array.from(files));
    
    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);

      // Upload files to the server
      const response = await uploadFiles(validFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      const uploadedFiles = await response.json();
      onUploadSuccess(uploadedFiles);
      
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) have been uploaded.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      // Reset progress after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("mb-6", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
          isUploading ? "pointer-events-none opacity-70" : "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">
            {isDragging
              ? "Drop files here to upload"
              : "Drag and drop files here or"}
          </p>
          <Button
            type="button"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              openFileSelector();
            }}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: PDF, DOCX, TXT, MD (Max: 10MB per file)
          </p>
        </div>
      </div>

      {isUploading && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Uploading files...</p>
              <span className="text-xs text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FileUpload;
