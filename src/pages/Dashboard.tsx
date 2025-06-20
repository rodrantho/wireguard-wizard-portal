import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getClientes, Cliente, deleteCliente } from "@/lib/supabase";
import { logAccess, updateClienteOrder } from "@/lib/auditService";
import ClienteForm from "@/components/ClienteForm";
import CommentsSection from "@/components/CommentsSection";
import ActivityTimeline from "@/components/ActivityTimeline";
import SystemAlerts from "@/components/SystemAlerts";
import DraggableClientList from "@/components/DraggableClientList";
import { ClienteFormData } from "@/lib/types";
import { createCliente, updateCliente } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Network, Heart, Filter, SortAsc, SortDesc, Settings, Activity, AlertTriangle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagManager from "@/components/TagManager";
import ViewModeSelector, { ViewMode } from "@/components/ViewModeSelector";
import { 
  getUserPreferences, 
  saveUserPreferences, 
  getUserClientOrder, 
  toggleClientFavorite, 
  UserPreferences,
  UserClientOrder
} from "@/lib/userPreferences";

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedEntityForComments, setSelectedEntityForComments] = useState<{id: string, name: string, type: 'cliente' | 'peer'} | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para personalización
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [clientOrders, setClientOrders] = useState<UserClientOrder[]>([]);
  const [sortField, setSortField] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  
  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
    // Log acceso al dashboard
    logAccess('view_dashboard', 'dashboard');
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [searchTerm, clientes, clientOrders, sortField, sortDirection, showOnlyFavorites]);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      const [clientesData, preferencesData, ordersData] = await Promise.all([
        getClientes(),
        getUserPreferences(),
        getUserClientOrder()
      ]);
      
      setClientes(clientesData);
      setUserPreferences(preferencesData);
      setClientOrders(ordersData);
      
      // Aplicar preferencias guardadas
      if (preferencesData) {
        setSortField(preferencesData.default_sort_field);
        setSortDirection(preferencesData.default_sort_direction as 'asc' | 'desc');
        if (preferencesData.view_mode) {
          setViewMode(preferencesData.view_mode as ViewMode);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSorting = () => {
    let filtered = clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.ip_cloud.includes(searchTerm)
    );

    // Filtrar solo favoritos si está activado
    if (showOnlyFavorites) {
      const favoriteIds = new Set(
        clientOrders.filter(order => order.is_favorite).map(order => order.cliente_id)
      );
      filtered = filtered.filter(cliente => favoriteIds.has(cliente.id));
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Cliente];
      let bValue: any = b[sortField as keyof Cliente];

      // Para ordenamiento personalizado
      if (sortField === 'custom_order') {
        const aOrder = clientOrders.find(order => order.cliente_id === a.id)?.custom_order || 0;
        const bOrder = clientOrders.find(order => order.cliente_id === b.id)?.custom_order || 0;
        aValue = aOrder;
        bValue = bOrder;
      }

      // Para favoritos
      if (sortField === 'favorite') {
        const aFav = clientOrders.find(order => order.cliente_id === a.id)?.is_favorite || false;
        const bFav = clientOrders.find(order => order.cliente_id === b.id)?.is_favorite || false;
        aValue = aFav ? 1 : 0;
        bValue = bFav ? 1 : 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredClientes(filtered);
  };

  const handleSortChange = async (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Guardar preferencias
    await saveUserPreferences({
      default_sort_field: field,
      default_sort_direction: newDirection
    });
  };

  const handleToggleFavorite = async (clienteId: string) => {
    try {
      await toggleClientFavorite(clienteId);
      // Refrescar órdenes de cliente
      const ordersData = await getUserClientOrder();
      setClientOrders(ordersData);
      
      // Log del acceso
      logAccess('toggle_favorite', 'cliente', clienteId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al cambiar favorito');
    }
  };

  const handleReorderClientes = async (reorderedClientes: Cliente[]) => {
    try {
      // Actualizar el orden local inmediatamente
      setFilteredClientes(reorderedClientes);
      
      // Actualizar el orden en la base de datos
      const updatePromises = reorderedClientes.map((cliente, index) => 
        updateClienteOrder(cliente.id, index)
      );
      
      await Promise.all(updatePromises);
      toast.success('Orden actualizado');
      
      // Log del acceso
      logAccess('reorder_clientes', 'clientes');
    } catch (error) {
      console.error('Error reordering clientes:', error);
      toast.error('Error al actualizar orden');
      // Revertir el cambio local en caso de error
      applyFiltersAndSorting();
    }
  };

  const handleShowComments = (clienteId: string, clienteName: string) => {
    setSelectedEntityForComments({
      id: clienteId,
      name: clienteName,
      type: 'cliente'
    });
    setIsCommentsOpen(true);
    
    // Log del acceso
    logAccess('view_comments', 'cliente', clienteId);
  };

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCliente = async (data: ClienteFormData) => {
    setIsFormSubmitting(true);
    try {
      const newCliente = await createCliente(data);
      setClientes([...clientes, newCliente]);
      setIsAddDialogOpen(false);
      toast.success("Cliente creado con éxito");
      
      // Log del acceso
      logAccess('create_cliente', 'cliente', newCliente.id);
    } catch (error) {
      console.error("Error al crear cliente:", error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleUpdateCliente = async (data: ClienteFormData) => {
    if (!selectedCliente) return;
    
    setIsFormSubmitting(true);
    try {
      await updateCliente(selectedCliente.id, data);
      fetchClientes();
      setIsEditDialogOpen(false);
      setSelectedCliente(null);
      toast.success("Cliente actualizado con éxito");
      
      // Log del acceso
      logAccess('update_cliente', 'cliente', selectedCliente.id);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast.error("Error al actualizar cliente");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await deleteCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      toast.success("Cliente eliminado con éxito");
      
      // Log del acceso
      logAccess('delete_cliente', 'cliente', id);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar cliente");
    }
  };
  
  const handleAddPeer = (clienteId: string) => {
    // Log del acceso
    logAccess('navigate_create_peer', 'cliente', clienteId);
    navigate(`/crear-peer/${clienteId}`);
  };
  
  const handleViewPeers = (clienteId: string) => {
    // Log del acceso
    logAccess('view_peers', 'cliente', clienteId);
    navigate(`/peers/${clienteId}`);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditDialogOpen(true);
    
    // Log del acceso
    logAccess('edit_cliente', 'cliente', cliente.id);
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    await saveUserPreferences({ view_mode: mode });
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Network className="h-8 w-8 text-vpn mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-white">Clientes <span className="text-vpn">WG-NST</span></h1>
            <p className="text-gray-400 text-sm">Gestión de clientes para VPN WireGuard</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Configuración Personal</DialogTitle>
                <DialogDescription>
                  Gestiona tus etiquetas y preferencias de visualización
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <TagManager onTagsChange={() => {}} />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-vpn hover:bg-vpn-dark">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo cliente para configurar VPN WireGuard
                </DialogDescription>
              </DialogHeader>
              <ClienteForm onSubmit={handleCreateCliente} isLoading={isFormSubmitting} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="clientes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="actividad">
            <Activity className="mr-2 h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="alertas">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="comentarios">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comentarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border/40"
              />
            </div>
            <div className="flex space-x-2">
              <Select value={sortField} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="ip_cloud">IP Pública</SelectItem>
                  <SelectItem value="created_at">Fecha de creación</SelectItem>
                  <SelectItem value="favorite">Favoritos</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange(sortField)}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={showOnlyFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              >
                <Heart className={`h-4 w-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
              </Button>

              <ViewModeSelector viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-12">
              <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn animate-spin"></div>
            </div>
          ) : filteredClientes.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
              <CardHeader>
                <CardTitle>No hay clientes</CardTitle>
                <CardDescription>
                  {searchTerm || showOnlyFavorites ? "No se encontraron resultados para los filtros aplicados." : "Crea un nuevo cliente para comenzar a gestionar configuraciones VPN WireGuard."}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-vpn hover:bg-vpn-dark">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <DraggableClientList
              clientes={filteredClientes}
              onEdit={handleEditCliente}
              onDelete={handleDeleteCliente}
              onView={handleViewPeers}
              onAddPeer={handleAddPeer}
              onShowComments={handleShowComments}
              onToggleFavorite={handleToggleFavorite}
              onReorder={handleReorderClientes}
              clientOrders={clientOrders}
              viewMode={viewMode}
            />
          )}
        </TabsContent>

        <TabsContent value="actividad">
          <ActivityTimeline />
        </TabsContent>

        <TabsContent value="alertas">
          <SystemAlerts />
        </TabsContent>

        <TabsContent value="comentarios">
          <div className="text-center py-8 text-gray-500">
            Selecciona un cliente para ver sus comentarios usando el botón de comentario en cada tarjeta de cliente.
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica los datos del cliente
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <ClienteForm
              initialData={{
                nombre: selectedCliente.nombre,
                ip_cloud: selectedCliente.ip_cloud,
                public_key: selectedCliente.public_key,
                interfaz: selectedCliente.interfaz,
                puerto: selectedCliente.puerto
              }}
              onSubmit={handleUpdateCliente}
              isLoading={isFormSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para comentarios */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Comentarios</DialogTitle>
          </DialogHeader>
          {selectedEntityForComments && (
            <CommentsSection
              entityType={selectedEntityForComments.type}
              entityId={selectedEntityForComments.id}
              entityName={selectedEntityForComments.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
