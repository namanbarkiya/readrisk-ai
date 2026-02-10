"use client";

import * as React from "react";
import { BarChart3, FileText, Home, Settings, User } from "lucide-react";
import { HistorySectionSidebar } from "@/components/dashboard/layout/sidebar/history-section";
import { MainSectionSidebar } from "@/components/dashboard/layout/sidebar/main-section";
import { TeamSwitcher } from "@/components/dashboard/layout/team-switcher";
import { UserPopover } from "@/components/dashboard/layout/user-popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "RiskRead AI",
      plan: "Professional",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Analyses",
      url: "/dashboard/analyses",
      icon: BarChart3,
      items: [
        {
          title: "All Analyses",
          url: "/dashboard/analyses",
        },
        {
          title: "New Analysis",
          url: "/dashboard/analyses/new",
        },
      ],
    },
    {
      title: "Profile",
      url: "/dashboard/account",
      icon: User,
      items: [
        {
          title: "Account",
          url: "/dashboard/account",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <MainSectionSidebar items={data.navMain} />
        <HistorySectionSidebar />
      </SidebarContent>
      <SidebarFooter>
        <UserPopover />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
