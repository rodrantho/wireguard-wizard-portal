
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { Users, Settings, FileText, LogOut, Network, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
      toast.success("Sesión cerrada");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-secondary/50 text-vpn font-medium border-l-2 border-vpn" 
      : "hover:bg-secondary/30 border-l-2 border-transparent";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background bg-grid-pattern bg-[size:50px_50px]">
        <Sidebar 
          className={collapsed ? "w-16 border-r border-border/40" : "w-64 border-r border-border/40"} 
          collapsible="icon"
        >
          <div className="p-4 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center">
                <Network className="h-6 w-6 text-vpn mr-2 animate-pulse-blue" />
                <h1 className="text-lg font-bold text-white">
                  <span className="text-vpn">WG</span>-NST
                </h1>
              </div>
            )}
            {collapsed && <Network className="h-6 w-6 text-vpn mx-auto animate-pulse-blue" />}
            <SidebarTrigger className={collapsed ? "mx-auto mt-4" : "ml-auto"} />
          </div>
          
          <SidebarContent className="mt-6">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={getNavClass}>
                    <Users className="mr-2 h-5 w-5" />
                    {!collapsed && <span>Clientes</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/peers" className={getNavClass}>
                    <ArrowRightLeft className="mr-2 h-5 w-5" />
                    {!collapsed && <span>Peers VPN</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClass}>
                    <Settings className="mr-2 h-5 w-5" />
                    {!collapsed && <span>Configuración</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-auto mb-4 px-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center border-border/40 hover:bg-secondary/50 hover:text-red-400" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Cerrar sesión</span>}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
