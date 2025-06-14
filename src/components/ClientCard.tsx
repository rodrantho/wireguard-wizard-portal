
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Eye, Star, StarOff, Plus, MessageSquare, GripVertical } from 'lucide-react';
import { Cliente } from '@/lib/supabase';
import { UserClientOrder } from '@/lib/userPreferences';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClientCardProps {
  cliente: Cliente & { peerCount?: number };
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onAddPeer: (id: string) => void;
  onShowComments?: (id: string, name: string) => void;
  userOrder?: UserClientOrder;
  onToggleFavorite?: (clienteId: string) => void;
  tags?: any[];
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function ClientCard({ 
  cliente, 
  onEdit, 
  onDelete, 
  onView,
  onAddPeer,
  onShowComments,
  userOrder, 
  onToggleFavorite,
  tags = [],
  isDragging = false,
  dragHandleProps = {}
}: ClientCardProps) {
  return (
    <Card className={`w-full transition-all ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
          {userOrder?.is_favorite && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <div className="flex space-x-1">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(cliente.id)}
              className="h-8 w-8 p-0"
            >
              {userOrder?.is_favorite ? (
                <StarOff className="h-4 w-4" />
              ) : (
                <Star className="h-4 w-4" />
              )}
            </Button>
          )}
          {onShowComments && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShowComments(cliente.id, cliente.nombre)}
              className="h-8 w-8 p-0"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onView(cliente.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(cliente)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el cliente "{cliente.nombre}" y todos sus peers VPN asociados.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(cliente.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>IP Cloud:</strong> {cliente.ip_cloud}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Interfaz:</strong> {cliente.interfaz}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Puerto:</strong> {cliente.puerto}
          </p>
          {cliente.peerCount !== undefined && (
            <p className="text-sm text-gray-600">
              <strong>Peers:</strong> {cliente.peerCount}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary"
                  style={{ backgroundColor: tag.user_tags.color + '20', color: tag.user_tags.color }}
                >
                  {tag.user_tags.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="pt-2 border-t mt-3">
            <Button 
              onClick={() => onAddPeer(cliente.id)}
              className="w-full bg-vpn hover:bg-vpn-dark"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Peer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
