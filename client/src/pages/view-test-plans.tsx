import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ViewTestPlans() {
  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-medium mb-4">Test Plan Management</h2>
        
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <a href="/" className="text-gray-500 hover:text-primary hover:border-primary border-transparent border-b-2 py-2 px-4 mr-4">
              Create Test Plan
            </a>
            <a href="/test-plans" className="text-primary-dark border-primary-dark font-medium border-b-2 py-2 px-4 mr-4">
              View Test Plans
            </a>
            <a href="/reports" className="text-gray-500 hover:text-primary hover:border-primary border-transparent border-b-2 py-2 px-4">
              Reports
            </a>
          </nav>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Plans</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-gray-500 text-center py-8">
            This page is under development. Test plan viewing will be available soon.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default ViewTestPlans;
