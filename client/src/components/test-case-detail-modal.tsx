import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TestCase } from "@shared/schema";
import { cn, getPriorityClassName, getTypeClassName } from "@/lib/utils";

interface TestCaseDetailModalProps {
  testCase: TestCase | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestCaseDetailModal({
  testCase,
  isOpen,
  onClose,
}: TestCaseDetailModalProps) {
  if (!testCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Test Case: {testCase.testId}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Test ID</h4>
            <p className="font-medium">{testCase.testId}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                getTypeClassName(testCase.type)
              )}
            >
              {testCase.type}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                getPriorityClassName(testCase.priority)
              )}
            >
              {testCase.priority}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
          <p>{testCase.description}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-1">
            Prerequisites
          </h4>
          <p>{testCase.prerequisites}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Test Steps</h4>
          <ul className="list-decimal pl-5 space-y-2">
            {testCase.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">
            Expected Results
          </h4>
          <p>{testCase.expectedResults}</p>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Edit Test Case</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TestCaseDetailModal;
