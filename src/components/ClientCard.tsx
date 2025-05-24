
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Eye, Star, StarOff } from 'lucide-react';
import { Cliente } from '@/lib/supabase';
import { UserClientOrder } from '@/lib/userPreferences';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClientCardProps {
  cliente: Cliente & { peerCount?: number };
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  userOrder?: UserClientOrder;
  onToggleFavorite?: (clienteId: string) => void;
  tags?: any[];
}

export default function ClientCard({ 
  cliente, 
  onEdit, 
  onDelete, 
  onView, 
  userOrder, 
  onToggleFavorite,
  tags = [] 
}: ClientCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
