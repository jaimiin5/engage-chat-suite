import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const DashboardAnalytics = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Analytics | ChatFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your chatbot performance and usage
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">Coming Soon</CardTitle>
            <CardDescription className="text-center">
              Analytics dashboard is under development. Track conversations, response times, and user satisfaction.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAnalytics;
