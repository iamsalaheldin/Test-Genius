import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Download, Edit } from "lucide-react";
import { TestCase } from "@shared/schema";
import { cn, getPriorityClassName, getTypeClassName } from "@/lib/utils";
import { exportTestCasesToCsv } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TestCaseTableProps {
  testCases: TestCase[];
  onViewTestCase: (testCase: TestCase) => void;
  onFilterChange: (type: string, priority: string) => void;
}

export function TestCaseTable({ testCases, onViewTestCase, onFilterChange }: TestCaseTableProps) {
  const [selectedTestCases, setSelectedTestCases] = useState<Record<number, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleSelectAllTestCases = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    
    const newSelectedTestCases: Record<number, boolean> = {};
    
    if (checked) {
      testCases.forEach(testCase => {
        newSelectedTestCases[testCase.id] = true;
      });
    }
    
    setSelectedTestCases(newSelectedTestCases);
  };

  const handleSelectTestCase = (testCaseId: number, checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    
    setSelectedTestCases(prev => ({
      ...prev,
      [testCaseId]: checked,
    }));
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTypeFilter(value);
    onFilterChange(value, priorityFilter);
  };

  const handlePriorityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPriorityFilter(value);
    onFilterChange(typeFilter, value);
  };

  const handleExportToCsv = async () => {
    const selectedIds = Object.entries(selectedTestCases)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id));
    
    if (selectedIds.length === 0) {
      toast({
        title: "No test cases selected",
        description: "Please select at least one test case to export.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await exportTestCasesToCsv(selectedIds);
      
      if (!response.ok) {
        throw new Error("Failed to export test cases");
      }
      
      // Get file name from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      const fileName = contentDisposition 
        ? contentDisposition.split("filename=")[1].trim().replace(/"/g, "") 
        : "test_cases.csv";
      
      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `${selectedIds.length} test cases exported to CSV.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleEditTestCases = () => {
    const selectedIds = Object.entries(selectedTestCases)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id));
      
    if (selectedIds.length === 0) {
      toast({
        title: "No test cases selected",
        description: "Please select at least one test case to edit.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Edit functionality",
      description: "Edit functionality coming soon.",
    });
  };

  const isAllSelected = 
    testCases.length > 0 && 
    testCases.every(testCase => selectedTestCases[testCase.id]);

  const isPartiallySelected =
    !isAllSelected && 
    testCases.some(testCase => selectedTestCases[testCase.id]);

  const selectedCount = Object.values(selectedTestCases).filter(Boolean).length;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Filter by:</span>
          <select 
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="all">All Types</option>
            <option value="functional">Functional</option>
            <option value="non-functional">Non-functional</option>
            <option value="integration">Integration</option>
          </select>
          <select 
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditTestCases}
            disabled={selectedCount === 0}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportToCsv}
            disabled={selectedCount === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="table-container mb-6 border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={isAllSelected} 
                  indeterminate={isPartiallySelected}
                  onCheckedChange={handleSelectAllTestCases}
                  aria-label="Select all test cases"
                />
              </TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="max-w-[300px]">Description</TableHead>
              <TableHead className="max-w-[200px]">Prerequisites</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testCases.length > 0 ? (
              testCases.map((testCase) => (
                <TableRow 
                  key={testCase.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedTestCases[testCase.id] || false}
                      onCheckedChange={(checked) => handleSelectTestCase(testCase.id, checked)}
                      aria-label={`Select test case ${testCase.testId}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{testCase.testId}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{testCase.description}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{testCase.prerequisites}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getPriorityClassName(testCase.priority)
                    )}>
                      {testCase.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getTypeClassName(testCase.type)
                    )}>
                      {testCase.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button 
                      className="text-gray-400 hover:text-primary"
                      onClick={() => onViewTestCase(testCase)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No test cases available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{testCases.length}</span> of{" "}
          <span className="font-medium">{testCases.length}</span> test cases
        </div>
        {testCases.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={true}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <span className="px-3 py-1 border border-primary bg-primary bg-opacity-10 text-primary rounded">
              1
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={true}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCaseTable;
