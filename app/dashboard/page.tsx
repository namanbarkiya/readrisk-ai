"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAnalysisList, useAnalysisStats } from "@/lib/query/hooks/analysis";
import { useMyProfile } from "@/lib/query/hooks/profile";
import { Analysis } from "@/lib/types/analysis";
import { calculateProfileCompletion } from "@/lib/utils/profile-utils";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: analysisResponse, isLoading: analysesLoading } =
    useAnalysisList();
  const stats = useAnalysisStats();

  const analyses = analysisResponse?.analyses || [];

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName =
    profile?.display_name || profile?.full_name || user?.name || "Anonymous";
  const avatarUrl = profile?.avatar_url || user?.avatar_url;
  const profileCompletion = profile
    ? calculateProfileCompletion(profile)
    : null;

  // Get recent analyses for activity feed
  const recentAnalyses = analyses.slice(0, 5);

  // Custom activities for dashboard
  const dashboardActivities = [
    ...recentAnalyses.map((analysis: Analysis) => ({
      id: analysis.id,
      title: `Analysis ${analysis.status}`,
      description: `${analysis.file_name} - ${analysis.status}`,
      timestamp: new Date(analysis.created_at).toLocaleDateString(),
      type: (analysis.status === "completed"
        ? "success"
        : analysis.status === "processing"
          ? "info"
          : "error") as "success" | "info" | "warning" | "error",
    })),
    {
      id: "profile-updated",
      title: "Profile updated",
      description: "Your profile information was updated",
      timestamp: "Today",
      type: "success" as const,
    },
    {
      id: "login-successful",
      title: "Login successful",
      description: "You successfully logged into your account",
      timestamp: "Today",
      type: "info" as const,
    },
  ];

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
            <p className="text-muted-foreground">
              Ready to analyze your next document for risk assessment?
            </p>
          </div>
        </div>
        <Link href="/dashboard/analyses/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysesLoading ? "..." : analyses.length}
            </div>
            <p className="text-xs text-muted-foreground">Documents analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Analyses
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analysesLoading
                ? "..."
                : analyses.filter((a: Analysis) => a.status === "completed")
                    .length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.avgScore ? `${stats.avgScore.toFixed(1)}/100` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk assessment score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Completion
            </CardTitle>
            {profileCompletion?.isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileCompletion?.completionPercentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {profileCompletion?.isComplete ? "Complete" : "Incomplete"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Analyses</CardTitle>
                <Link href="/dashboard/analyses">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {analysesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading analyses...
                  </p>
                </div>
              ) : recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis: Analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {analysis.file_name.endsWith(".pdf")
                            ? "📄"
                            : analysis.file_name.endsWith(".docx")
                              ? "📝"
                              : "📊"}
                        </div>
                        <div>
                          <p className="font-medium">{analysis.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(analysis.status)}>
                          {analysis.status}
                        </Badge>
                        {analysis.overall_score && (
                          <Badge variant="secondary">
                            {analysis.overall_score.toFixed(1)}
                          </Badge>
                        )}
                        {analysis.risk_level && (
                          <Badge
                            variant="outline"
                            className={getRiskLevelColor(analysis.risk_level)}
                          >
                            {analysis.risk_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first document analysis
                  </p>
                  <Link href="/dashboard/analyses/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Analysis
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={dashboardActivities} />

      {/* Risk Assessment Overview */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Overview</CardTitle>
            <CardDescription>
              Summary of your document risk assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.completed}
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed Analyses
                </p>
                <div className="mt-2">
                  <Progress
                    value={(stats.completed / stats.total) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {stats.avgScore.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average Risk Score
                </p>
                <div className="mt-2">
                  <Progress value={stats.avgScore} className="h-2" />
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.processing}
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently Processing
                </p>
                <div className="mt-2">
                  <Progress
                    value={(stats.processing / stats.total) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
