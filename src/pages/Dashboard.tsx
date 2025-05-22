
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getClientes, Cliente, deleteCliente } from "@/lib/supabase";
import ClienteForm from "@/components/ClienteForm";
import { ClienteFormData } from "@/lib/types";
import { createCliente, updateCliente } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash, FileText, Network, Users, Server, Database } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.ip_cloud.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

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
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await deleteCliente(id);
      setClientes(clientes.filter(c => c.id !== id));
      toast.success("Cliente eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };
  
  const handleAddPeer = (clienteId: string) => {
    navigate(`/crear-peer/${clienteId}`);
  };
  
  const handleViewPeers = (clienteId: string) => {
    navigate(`/peers/${clienteId}`);
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
            <ClienteForm 
              onSubmit={handleCreateCliente} 
              isLoading={isFormSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar por nombre o IP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md border-border/40"
        />
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
              {searchTerm ? "No se encontraron resultados para la búsqueda." : "Crea un nuevo cliente para comenzar a gestionar configuraciones VPN WireGuard."}
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
        <div className="grid gap-6">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="bg-cyber-glow backdrop-blur-sm border border-border/30 hover:border-vpn/40 transition-colors duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-vpn mr-2" />
                    <CardTitle>{cliente.nombre}</CardTitle>
                  </div>
                  <span className="text-xs text-gray-400 bg-secondary/50 px-2 py-1 rounded-md">
                    Interfaz: {cliente.interfaz}
                  </span>
                </div>
                <CardDescription className="mt-2">Cliente WireGuard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background/60 rounded-md p-3">
                      <div className="flex items-center mb-1">
                        <Database className="h-4 w-4 text-vpn-light mr-2" />
                        <p className="text-sm font-medium text-gray-300">IP Pública</p>
                      </div>
                      <p className="text-sm text-gray-400 ml-6">{cliente.ip_cloud}</p>
                    </div>
                    <div className="bg-background/60 rounded-md p-3">
                      <div className="flex items-center mb-1">
                        <Network className="h-4 w-4 text-vpn-light mr-2" />
                        <p className="text-sm font-medium text-gray-300">Clave Pública</p>
                      </div>
                      <p className="text-sm text-gray-400 ml-6 truncate">{cliente.public_key}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/20 pt-4">
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen && selectedCliente?.id === cliente.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setSelectedCliente(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-border/40 hover:bg-secondary/50" onClick={() => setSelectedCliente(cliente)}>
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border/50">
                      <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                          Actualiza la información del cliente
                        </DialogDescription>
                      </DialogHeader>
                      {selectedCliente && (
                        <ClienteForm 
                          onSubmit={handleUpdateCliente} 
                          initialData={selectedCliente}
                          isLoading={isFormSubmitting}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-700/30 hover:bg-red-950/30">
                        <Trash className="mr-1 h-4 w-4" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border/50">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará el cliente y todos sus peers VPN asociados. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border/40 hover:bg-secondary/50">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteCliente(cliente.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-border/40 hover:bg-secondary/50" onClick={() => handleViewPeers(cliente.id)}>
                    <FileText className="mr-1 h-4 w-4" />
                    Ver Peers
                  </Button>
                  <Button size="sm" className="bg-vpn hover:bg-vpn-dark" onClick={() => handleAddPeer(cliente.id)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Crear Peer
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
