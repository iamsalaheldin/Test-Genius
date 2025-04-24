import { cn, formatFileSize, getFileIcon } from "@/lib/utils";
import { File as FileIcon, X } from "lucide-react";
import { File } from "@shared/schema";
import { deleteFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface UploadedFileItemProps {
  file: File;
  className?: string;
}

export function UploadedFileItem({ file, className }: UploadedFileItemProps) {
  const { toast } = useToast();

  const { mutate: removeFile, isPending } = useMutation({
    mutationFn: (id: number) => deleteFile(id),
    onSuccess: () => {
      toast({
        title: "File removed",
        description: `${file.name} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
    onError: (error) => {
      toast({
        title: "Error removing file",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFile(file.id);
  };

  const fileSize = formatFileSize(file.size);
  const iconName = getFileIcon(file.type);

  return (
    <div 
      className={cn(
        "flex items-center justify-between bg-gray-50 p-3 rounded mb-2 fade-in",
        isPending && "opacity-50",
        className
      )}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2">
          <FileIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-sm truncate max-w-[180px] sm:max-w-xs md:max-w-md">{file.name}</p>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="bg-success bg-opacity-10 text-success px-2 py-1 rounded-full text-xs mr-2">
          valid
        </span>
        <button 
          className="text-gray-400 hover:text-destructive transition-colors disabled:opacity-50"
          onClick={handleRemoveFile}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default UploadedFileItem;
