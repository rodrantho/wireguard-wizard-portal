
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Palette } from 'lucide-react';
import { getUserTags, createUserTag, updateUserTag, deleteUserTag, UserTag } from '@/lib/userPreferences';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
];

interface TagManagerProps {
  onTagsChange?: () => void;
}

export default function TagManager({ onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<UserTag[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<UserTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const data = await getUserTags();
    setTags(data);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    setLoading(true);
    try {
      await createUserTag(newTagName.trim(), selectedColor);
      await fetchTags();
      setNewTagName('');
      setSelectedColor(PRESET_COLORS[0]);
      setIsCreateOpen(false);
      onTagsChange?.();
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) return;
    
    setLoading(true);
    try {
      await updateUserTag(editingTag.id, { 
        name: newTagName.trim(), 
        color: selectedColor 
      });
      await fetchTags();
      setEditingTag(null);
      setNewTagName('');
      setSelectedColor(PRESET_COLORS[0]);
      onTagsChange?.();
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setLoading(true);
    try {
      await deleteUserTag(tagId);
      await fetchTags();
      onTagsChange?.();
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (tag: UserTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const resetForm = () => {
    setNewTagName('');
    setSelectedColor(PRESET_COLORS[0]);
    setEditingTag(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Mis Etiquetas</h3>
        <Dialog open={isCreateOpen || !!editingTag} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Etiqueta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nombre</label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nombre de la etiqueta"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={editingTag ? handleUpdateTag : handleCreateTag}
                  disabled={loading || !newTagName.trim()}
                >
                  {loading ? 'Guardando...' : (editingTag ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="group relative">
            <Badge 
              variant="secondary" 
              className="text-white pr-8"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </Badge>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button
                onClick={() => openEditDialog(tag)}
                className="text-white hover:text-gray-200"
              >
                <Edit className="h-3 w-3" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-white hover:text-gray-200">
                    <Trash className="h-3 w-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará la etiqueta "{tag.name}" y la removerá de todos los clientes. 
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tienes etiquetas creadas. Crea una para organizar tus clientes.
          </p>
        )}
      </div>
    </div>
  );
}
