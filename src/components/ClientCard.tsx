
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash, FileText, Plus, Heart, Server, Database, Network } from 'lucide-react';
import { Cliente } from '@/lib/supabase';
import ClienteForm from './ClienteForm';
import ClientTagSelector from './ClientTagSelector';
import { ClienteFormData } from '@/lib/types';

export type ViewMode = 'expanded' | 'grid' | 'list';

interface ClientCardProps {
  cliente: Cliente;
  viewMode: ViewMode;
  isFormSubmitting: boolean;
  isEditDialogOpen: boolean;
  selectedClienteId: string | null;
  isFavorite: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onViewPeers: (id: string) => void;
  onAddPeer: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdate: (data: ClienteFormData) => void;
  onEditDialogChange: (open: boolean) => void;
}

export default function ClientCard({
  cliente,
  viewMode,
  isFormSubmitting,
  isEditDialogOpen,
  selectedClienteId,
  isFavorite,
  onEdit,
  onDelete,
  onViewPeers,
  onAddPeer,
  onToggleFavorite,
  onUpdate,
  onEditDialogChange
}: ClientCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="bg-cyber-glow backdrop-blur-sm border border-border/30 hover:border-vpn/40 transition-colors duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Server className="h-5 w-5 text-vpn flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white truncate">{cliente.nombre}</h3>
                  <button
                    onClick={() => onToggleFavorite(cliente.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{cliente.ip_cloud}</span>
                  <span>Interfaz: {cliente.interfaz}</span>
                </div>
              </div>
              <ClientTagSelector clienteId={cliente.id} />
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Dialog open={isEditDialogOpen && selectedClienteId === cliente.id} onOpenChange={onEditDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => onEdit(cliente)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-border/50">
                  <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>Actualiza la información del cliente</DialogDescription>
                  </DialogHeader>
                  <ClienteForm onSubmit={onUpdate} initialData={cliente} isLoading={isFormSubmitting} />
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-700/30 hover:bg-red-950/30">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará el cliente y todos sus peers VPN asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(cliente.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button variant="outline" size="sm" onClick={() => onViewPeers(cliente.id)}>
                <FileText className="mr-1 h-4 w-4" />
                Peers
              </Button>
              <Button size="sm" className="bg-vpn hover:bg-vpn-dark" onClick={() => onAddPeer(cliente.id)}>
                <Plus className="mr-1 h-4 w-4" />
                Crear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <Card className="bg-cyber-glow backdrop-blur-sm border border-border/30 hover:border-vpn/40 transition-colors duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-4 w-4 text-vpn mr-2" />
              <CardTitle className="text-sm flex items-center">
                {cliente.nombre}
                <button
                  onClick={() => onToggleFavorite(cliente.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className={`h-3 w-3 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </button>
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs">
            <ClientTagSelector clienteId={cliente.id} />
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <Database className="h-3 w-3 text-vpn-light mr-1" />
              <span className="text-gray-400">{cliente.ip_cloud}</span>
            </div>
            <div className="flex items-center">
              <Network className="h-3 w-3 text-vpn-light mr-1" />
              <span className="text-gray-400">Int: {cliente.interfaz}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex-col space-y-2">
          <div className="flex space-x-1 w-full">
            <Dialog open={isEditDialogOpen && selectedClienteId === cliente.id} onOpenChange={onEditDialogChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onEdit(cliente)}>
                  <Edit className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                  <DialogDescription>Actualiza la información del cliente</DialogDescription>
                </DialogHeader>
                <ClienteForm onSubmit={onUpdate} initialData={cliente} isLoading={isFormSubmitting} />
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-red-500 border-red-700/30">
                  <Trash className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará el cliente y todos sus peers VPN asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(cliente.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex space-x-1 w-full">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onViewPeers(cliente.id)}>
              <FileText className="h-3 w-3" />
            </Button>
            <Button size="sm" className="flex-1 text-xs bg-vpn hover:bg-vpn-dark" onClick={() => onAddPeer(cliente.id)}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Vista expandida (por defecto)
  return (
    <Card className="bg-cyber-glow backdrop-blur-sm border border-border/30 hover:border-vpn/40 transition-colors duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className="h-5 w-5 text-vpn mr-2" />
            <CardTitle className="flex items-center">
              {cliente.nombre}
              <button
                onClick={() => onToggleFavorite(cliente.id)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </button>
            </CardTitle>
          </div>
          <span className="text-xs text-gray-400 bg-secondary/50 px-2 py-1 rounded-md">
            Interfaz: {cliente.interfaz}
          </span>
        </div>
        <CardDescription className="mt-2 flex items-center justify-between">
          <span>Cliente WireGuard</span>
          <ClientTagSelector clienteId={cliente.id} />
        </CardDescription>
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
          <Dialog open={isEditDialogOpen && selectedClienteId === cliente.id} onOpenChange={onEditDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-border/40 hover:bg-secondary/50" onClick={() => onEdit(cliente)}>
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>Actualiza la información del cliente</DialogDescription>
              </DialogHeader>
              <ClienteForm onSubmit={onUpdate} initialData={cliente} isLoading={isFormSubmitting} />
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
                <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => onDelete(cliente.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="border-border/40 hover:bg-secondary/50" onClick={() => onViewPeers(cliente.id)}>
            <FileText className="mr-1 h-4 w-4" />
            Ver Peers
          </Button>
          <Button size="sm" className="bg-vpn hover:bg-vpn-dark" onClick={() => onAddPeer(cliente.id)}>
            <Plus className="mr-1 h-4 w-4" />
            Crear Peer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
