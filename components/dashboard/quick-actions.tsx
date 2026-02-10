"use client";

import Link from "next/link";
import {
  BarChart3,
  Download,
  FileText,
  History,
  Plus,
  Settings,
  Upload,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuickAction {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  description?: string;
}

interface QuickActionsProps {
  title?: string;
  description?: string;
  actions?: QuickAction[];
  compact?: boolean;
}

const defaultActions: QuickAction[] = [
  {
    label: "New Analysis",
    href: "/dashboard/analyses/new",
    icon: Plus,
    description: "Upload and analyze a document",
  },
  {
    label: "View All Analyses",
    href: "/dashboard/analyses",
    icon: History,
    description: "Browse your analysis history",
  },
  {
    label: "Download Sample",
    icon: Download,
    description: "Get a sample document to test",
    onClick: () => {
      const link = document.createElement("a");
      link.href = "/sample-test-document.txt";
      link.download = "sample-risk-assessment.txt";
      link.click();
    },
  },
  {
    label: "Account Settings",
    href: "/dashboard/account",
    icon: Settings,
    description: "Manage your profile and settings",
  },
];

export function QuickActions({
  title = "Quick Actions",
  description = "Common tasks and shortcuts",
  actions = defaultActions,
  compact = false,
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle
          className={`flex items-center gap-2 ${compact ? "text-base" : ""}`}
        >
          <Zap className={compact ? "h-4 w-4" : "h-5 w-5"} />
          {title}
        </CardTitle>
        {!compact && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const buttonContent = (
            <div className="space-y-1">
              <Button
                variant="outline"
                className={`w-full justify-start ${compact ? "h-9 text-sm" : "h-10"}`}
                onClick={action.onClick}
              >
                <Icon className={`mr-2 ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
                {action.label}
              </Button>
              {!compact && action.description && (
                <p className="text-xs text-muted-foreground px-1">
                  {action.description}
                </p>
              )}
            </div>
          );

          if (action.href) {
            return (
              <div key={index} className="block">
                <Link href={action.href} className="block">
                  {buttonContent}
                </Link>
              </div>
            );
          }

          return <div key={index}>{buttonContent}</div>;
        })}
      </CardContent>
    </Card>
  );
}
