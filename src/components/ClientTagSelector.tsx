
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Tag } from 'lucide-react';
import { 
  getUserTags, 
  getClientTags, 
  assignTagToClient, 
  removeTagFromClient, 
  UserTag, 
  ClientUserTag 
} from '@/lib/userPreferences';

interface ClientTagSelectorProps {
  clienteId: string;
  onTagsChange?: () => void;
}

export default function ClientTagSelector({ clienteId, onTagsChange }: ClientTagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<UserTag[]>([]);
  const [clientTags, setClientTags] = useState<ClientUserTag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, clienteId]);

  useEffect(() => {
    fetchClientTags();
  }, [clienteId]);

  const fetchData = async () => {
    const [tags, clientTagsData] = await Promise.all([
      getUserTags(),
      getClientTags(clienteId)
    ]);
    setAvailableTags(tags);
    setClientTags(clientTagsData);
  };

  const fetchClientTags = async () => {
    const data = await getClientTags(clienteId);
    setClientTags(data);
  };

  const handleAssignTag = async (tagId: string) => {
    setLoading(true);
    try {
      await assignTagToClient(clienteId, tagId);
      await fetchData();
      onTagsChange?.();
    } catch (error) {
      console.error('Error assigning tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    try {
      await removeTagFromClient(clienteId, tagId);
      await fetchData();
      onTagsChange?.();
    } catch (error) {
      console.error('Error removing tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignedTagIds = new Set(clientTags.map(ct => ct.tag_id));
  const unassignedTags = availableTags.filter(tag => !assignedTagIds.has(tag.id));

  return (
    <div className="flex items-center space-x-2">
      {/* Mostrar etiquetas asignadas */}
      {clientTags.map((clientTag) => (
        <div key={clientTag.id} className="group relative">
          <Badge 
            variant="secondary" 
            className="text-white pr-6"
            style={{ backgroundColor: clientTag.user_tags.color }}
          >
            {clientTag.user_tags.name}
            <button
              onClick={() => handleRemoveTag(clientTag.tag_id)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={loading}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      ))}

      {/* Botón para agregar etiquetas */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 mr-1" />
            Etiquetas
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Etiquetas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Etiquetas asignadas */}
            {clientTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Etiquetas asignadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {clientTags.map((clientTag) => (
                    <div key={clientTag.id} className="group relative">
                      <Badge 
                        variant="secondary" 
                        className="text-white pr-6"
                        style={{ backgroundColor: clientTag.user_tags.color }}
                      >
                        {clientTag.user_tags.name}
                        <button
                          onClick={() => handleRemoveTag(clientTag.tag_id)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etiquetas disponibles */}
            {unassignedTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Agregar etiquetas:</h4>
                <div className="flex flex-wrap gap-2">
                  {unassignedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAssignTag(tag.id)}
                      disabled={loading}
                      className="group relative"
                    >
                      <Badge 
                        variant="outline" 
                        className="hover:opacity-80 pr-6 cursor-pointer"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                        <Plus className="h-3 w-3 absolute right-1 top-1/2 -translate-y-1/2" />
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableTags.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes etiquetas creadas. Ve a configuración para crear algunas.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
