"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenIcon,
  Folder,
  Forward,
  History,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAnalysisList } from "@/lib/query/hooks/analysis";
import { Analysis } from "@/lib/types/analysis";

export function HistorySectionSidebar() {
  const { isMobile } = useSidebar();
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch analysis history with pagination
  const { data: analysisResponse, isLoading } = useAnalysisList({
    limit: displayCount,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const analyses = analysisResponse?.analyses || [];
  const totalAnalyses = analysisResponse?.total || 0;
  const hasMoreItems = displayCount < totalAnalyses;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDisplayCount((prev) => prev + 10);
    setIsLoadingMore(false);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) return "📄";
    if (fileName.endsWith(".docx")) return "📝";
    if (fileName.endsWith(".xlsx")) return "📊";
    return "📄";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          // Loading state
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading...
            </span>
          </div>
        ) : analyses.length > 0 ? (
          // Analysis history items
          analyses.map((analysis: Analysis) => (
            <SidebarMenuItem key={analysis.id}>
              <SidebarMenuButton asChild>
                <Link href={`/dashboard/analyses/${analysis.id}`}>
                  <span className="text-lg flex-shrink-0">
                    {getFileIcon(analysis.file_name)}
                  </span>
                  <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                    <span className="truncate text-sm font-medium w-full max-w-[150px]">
                      {analysis.file_name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full max-w-[120px]">
                      {formatDate(analysis.created_at)}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/analyses/${analysis.id}`}>
                      <BookOpenIcon className="text-muted-foreground" />
                      <span>View Analysis</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="text-red-600" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <History className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              No analyses yet
            </span>
            <Link
              href="/dashboard/analyses/new"
              className="text-xs text-primary hover:underline mt-1"
            >
              Create your first analysis
            </Link>
          </div>
        )}

        {/* Load More Button - Only show if there are more items */}
        {analyses.length > 0 && hasMoreItems && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70 cursor-pointer"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="text-sidebar-foreground/70" />
              )}
              <span>{isLoadingMore ? "Loading..." : "Load More"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
