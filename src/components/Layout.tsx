
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { Users, LogOut, ArrowRightLeft, Network, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CommandDialog, CommandInput, CommandList, CommandItem, Command } from "@/components/ui/command";
import { getClientes, Cliente } from "@/lib/supabase";
import { useEffect } from "react";

const APP_VERSION = "2.0.6";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Listen to keyboard shortcut to open search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    
    if (commandOpen) {
      loadClientes();
    }
  }, [commandOpen]);
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
      toast.success("Sesión cerrada");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const filteredClientes = searchQuery
    ? clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cliente.ip_cloud.includes(searchQuery)
      )
    : clientes;
    
  const navigateToClient = (clienteId: string) => {
    navigate(`/peers/${clienteId}`);
    setCommandOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-secondary/50 text-vpn font-medium border-l-2 border-vpn" 
      : "hover:bg-secondary/30 border-l-2 border-transparent";

  return (
    <>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command className="rounded-lg border-none bg-card">
          <CommandInput 
            placeholder="Buscar clientes..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-b border-border/40"
          />
          <CommandList>
            {filteredClientes.length === 0 && searchQuery && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron clientes
              </p>
            )}
            {filteredClientes.map((cliente) => (
              <CommandItem 
                key={cliente.id} 
                onSelect={() => navigateToClient(cliente.id)}
                className="flex items-center cursor-pointer hover:bg-secondary/50"
              >
                <Users className="mr-2 h-4 w-4 text-vpn" />
                <span>{cliente.nombre}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {cliente.ip_cloud}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background bg-grid-pattern bg-[size:50px_50px]">
          <Sidebar 
            className={collapsed ? "w-16 border-r border-border/40" : "w-64 border-r border-border/40"} 
            collapsible="icon"
          >
            <div className="p-4 flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center">
                  <Network className="h-6 w-6 text-vpn" />
                  <h1 className="text-lg font-bold text-white ml-2">
                    <span className="text-vpn">WG</span>-NST
                  </h1>
                </div>
              )}
              {collapsed && <Network className="h-6 w-6 text-vpn mx-auto" />}
              <SidebarTrigger className={collapsed ? "mx-auto mt-4" : ""} />
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
              
              {/* Versión del sistema */}
              {!collapsed && (
                <div className="mt-2 px-4 text-center">
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    <span>v{APP_VERSION}</span>
                  </div>
                </div>
              )}
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="py-2 px-4 border-b border-border/40 flex justify-between items-center bg-background/80 backdrop-blur-sm">
              <div className="flex items-center">
                <h2 className="text-sm font-medium text-vpn">
                  WireGuard VPN Manager
                </h2>
                <span className="ml-2 text-xs bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">
                  v{APP_VERSION}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-border/40 bg-background/50 hover:bg-secondary/50"
                onClick={() => setCommandOpen(true)}
              >
                <span className="mr-2">🔍 Buscar clientes</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
