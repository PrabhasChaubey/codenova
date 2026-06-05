import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import { getAllPlaygroundForUser } from "@/features/dashboard/actions"
import { TooltipProvider } from "@/components/ui/tooltip";
import type React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const playgroundData = await getAllPlaygroundForUser()

  // Store icon names (strings) instead of the components themselves
  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  }

  const formattedPlaygroundData =
    playgroundData?.map((playground) => ({
      id: playground.id,
      name: playground.title,
      starred: playground.Starmark?.[0]?.isMarked || false,
      // Pass the icon name as a string
      icon: technologyIconMap[playground.template] || "Code2", // Default to "Code2" if template not found
    })) || []

return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden">
          <DashboardSidebar
            initialPlaygroundData={formattedPlaygroundData}
          />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}