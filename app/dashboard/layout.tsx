import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import type React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden">
          <DashboardSidebar initialPlaygroundData={[]} />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}