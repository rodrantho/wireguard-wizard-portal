
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { Users, Settings, FileText, LogOut } from "lucide-react";
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
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar 
          className={collapsed ? "w-16 border-r" : "w-64 border-r"} 
          collapsible="icon"
        >
          <div className="p-4 flex items-center justify-between">
            {!collapsed && <h1 className="text-lg font-bold text-vpn">WireGuard VPN</h1>}
            <SidebarTrigger className="ml-auto" onClick={() => setCollapsed(!collapsed)} />
          </div>
          
          <SidebarContent>
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
                    <FileText className="mr-2 h-5 w-5" />
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
                className="w-full flex items-center" 
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
