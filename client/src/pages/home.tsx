import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateTestCases } from "@/lib/api";
import { File, TestCase } from "@shared/schema";
import FileUpload from "@/components/file-upload";
import UploadedFileItem from "@/components/uploaded-file-item";
import TestCaseTable from "@/components/test-case-table";
import TestCaseDetailModal from "@/components/test-case-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function Home() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Query for uploaded files
  const { 
    data: uploadedFiles = [], 
    isLoading: isLoadingFiles 
  } = useQuery({
    queryKey: ['/api/files'],
  });

  // Query for test cases
  const { 
    data: testCases = [], 
    isLoading: isLoadingTestCases,
    refetch: refetchTestCases
  } = useQuery({
    queryKey: ['/api/test-cases', { type: typeFilter, priority: priorityFilter }],
  });

  // Mutation for generating test cases
  const { mutate: generateTests, isPending: isGenerating } = useMutation({
    mutationFn: (fileIds: number[]) => generateTestCases(fileIds),
    onSuccess: () => {
      toast({
        title: "Test cases generated",
        description: "Test cases have been successfully generated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate test cases",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleUploadSuccess = (files: File[]) => {
    queryClient.invalidateQueries({ queryKey: ['/api/files'] });
  };

  const handleGenerateTestCases = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one file to generate test cases.",
        variant: "destructive",
      });
      return;
    }

    const fileIds = uploadedFiles.map((file) => file.id);
    generateTests(fileIds);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (type: string, priority: string) => {
    setTypeFilter(type);
    setPriorityFilter(priority);
    refetchTestCases();
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-medium mb-4">Test Plan Management</h2>
        
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <Link href="/">
              <a className="text-primary-dark border-primary-dark font-medium border-b-2 py-2 px-4 mr-4">
                Create Test Plan
              </a>
            </Link>
            <Link href="/test-plans">
              <a className="text-gray-500 hover:text-primary hover:border-primary border-transparent border-b-2 py-2 px-4 mr-4">
                View Test Plans
              </a>
            </Link>
            <Link href="/reports">
              <a className="text-gray-500 hover:text-primary hover:border-primary border-transparent border-b-2 py-2 px-4">
                Reports
              </a>
            </Link>
          </nav>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">1. Upload Files for Test Case Generation</h3>
        <p className="text-gray-600 mb-4">Upload your specification files to generate test cases. Supported formats: PDF, DOCX, TXT, MD (Max: 10MB per file)</p>
        
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <div className="mb-4">
          <h4 className="font-medium mb-2">Uploaded Files</h4>
          {isLoadingFiles ? (
            <Card>
              <CardContent className="p-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </CardContent>
            </Card>
          ) : uploadedFiles.length > 0 ? (
            uploadedFiles.map((file) => (
              <UploadedFileItem key={file.id} file={file} />
            ))
          ) : (
            <p className="text-gray-500 italic">No files uploaded yet</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateTestCases} 
            disabled={isGenerating || uploadedFiles.length === 0}
            className="flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.9 11.5h.2c.2-.4.5-.8.9-1 .1-.1.2-.3.1-.4"/>
                  <path d="M14.9 11.5c.2.6.2 1.1 0 1.6-.1.2-.3.5-.6.7-.2.1-.3.3-.5.6-.2.3-.4.5-.6.6-.4.1-.7.2-1.2.1-.5-.1-.7-.2-.9-.4 0-.3.1-.5.2-.7.1-.2.3-.4.5-.6.4-.3.7-.6.9-1 .2-.3.2-.7 0-1"/>
                  <path d="M12 8V7"/>
                  <path d="M12 17v-1"/>
                </svg>
                Generate Test Cases
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">2. Generated Test Cases</h3>
        
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Generating test cases with Google Gemini AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a minute depending on file complexity</p>
          </div>
        )}

        {!isGenerating && (
          <TestCaseTable 
            testCases={testCases} 
            onViewTestCase={handleViewTestCase}
            onFilterChange={handleFilterChange}
          />
        )}
      </section>

      <TestCaseDetailModal 
        testCase={selectedTestCase} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </main>
  );
}

export default Home;
