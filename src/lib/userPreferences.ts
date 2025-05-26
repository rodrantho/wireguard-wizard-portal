import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserTag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type ClientUserTag = {
  id: string;
  user_id: string;
  cliente_id: string;
  tag_id: string;
  priority: number;
  created_at: string;
  user_tags: UserTag;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  default_sort_field: string;
  default_sort_direction: string;
  items_per_page: number;
  view_mode: string;
  created_at: string;
  updated_at: string;
};

export type UserClientOrder = {
  id: string;
  user_id: string;
  cliente_id: string;
  custom_order: number;
  is_favorite: boolean;
  last_accessed: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Funciones para etiquetas de usuario
export async function getUserTags() {
  try {
    const { data, error } = await supabase
      .from('user_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as UserTag[];
  } catch (error: any) {
    toast.error('Error al obtener etiquetas: ' + error.message);
    return [];
  }
}

export async function createUserTag(name: string, color: string = '#3b82f6') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('user_tags')
      .insert([{ user_id: user.id, name, color }])
      .select()
      .single();

    if (error) throw error;
    toast.success('Etiqueta creada con éxito');
    return data as UserTag;
  } catch (error: any) {
    toast.error('Error al crear etiqueta: ' + error.message);
    throw error;
  }
}

export async function updateUserTag(id: string, updates: Partial<Pick<UserTag, 'name' | 'color'>>) {
  try {
    const { error } = await supabase
      .from('user_tags')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    toast.success('Etiqueta actualizada con éxito');
  } catch (error: any) {
    toast.error('Error al actualizar etiqueta: ' + error.message);
    throw error;
  }
}

export async function deleteUserTag(id: string) {
  try {
    const { error } = await supabase
      .from('user_tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Etiqueta eliminada con éxito');
  } catch (error: any) {
    toast.error('Error al eliminar etiqueta: ' + error.message);
    throw error;
  }
}

// Funciones para asignar etiquetas a clientes
export async function getClientTags(clienteId?: string) {
  try {
    let query = supabase
      .from('client_user_tags')
      .select('*, user_tags(*)');
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data, error } = await query.order('priority');

    if (error) throw error;
    return data as ClientUserTag[];
  } catch (error: any) {
    toast.error('Error al obtener etiquetas del cliente: ' + error.message);
    return [];
  }
}

export async function assignTagToClient(clienteId: string, tagId: string, priority: number = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('client_user_tags')
      .insert([{ 
        user_id: user.id, 
        cliente_id: clienteId, 
        tag_id: tagId, 
        priority 
      }])
      .select();

    if (error) throw error;
    toast.success('Etiqueta asignada al cliente');
    return data[0];
  } catch (error: any) {
    toast.error('Error al asignar etiqueta: ' + error.message);
    throw error;
  }
}

export async function removeTagFromClient(clienteId: string, tagId: string) {
  try {
    const { error } = await supabase
      .from('client_user_tags')
      .delete()
      .eq('cliente_id', clienteId)
      .eq('tag_id', tagId);

    if (error) throw error;
    toast.success('Etiqueta removida del cliente');
  } catch (error: any) {
    toast.error('Error al remover etiqueta: ' + error.message);
    throw error;
  }
}

// Funciones para preferencias de usuario
export async function getUserPreferences() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserPreferences | null;
  } catch (error: any) {
    console.error('Error al obtener preferencias:', error);
    return null;
  }
}

export async function saveUserPreferences(preferences: Partial<Pick<UserPreferences, 'default_sort_field' | 'default_sort_direction' | 'items_per_page' | 'view_mode'>>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ 
        user_id: user.id, 
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    toast.success('Preferencias guardadas');
  } catch (error: any) {
    toast.error('Error al guardar preferencias: ' + error.message);
    throw error;
  }
}

// Funciones para orden personalizado de clientes
export async function getUserClientOrder() {
  try {
    const { data, error } = await supabase
      .from('user_client_order')
      .select('*')
      .order('custom_order');

    if (error) throw error;
    return data as UserClientOrder[];
  } catch (error: any) {
    console.error('Error al obtener orden de clientes:', error);
    return [];
  }
}

export async function updateClientOrder(clienteId: string, updates: Partial<Pick<UserClientOrder, 'custom_order' | 'is_favorite' | 'notes'>>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_client_order')
      .upsert({ 
        user_id: user.id, 
        cliente_id: clienteId,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error: any) {
    toast.error('Error al actualizar orden: ' + error.message);
    throw error;
  }
}

export async function toggleClientFavorite(clienteId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Primero obtener el estado actual - usar maybeSingle en lugar de single
    const { data: current, error: fetchError } = await supabase
      .from('user_client_order')
      .select('is_favorite')
      .eq('user_id', user.id)
      .eq('cliente_id', clienteId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching current favorite state:', fetchError);
      throw fetchError;
    }

    const newFavoriteState = !current?.is_favorite;

    const { error } = await supabase
      .from('user_client_order')
      .upsert({ 
        user_id: user.id, 
        cliente_id: clienteId,
        is_favorite: newFavoriteState,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,cliente_id'
      });

    if (error) throw error;
    toast.success(newFavoriteState ? 'Cliente marcado como favorito' : 'Cliente removido de favoritos');
    return newFavoriteState;
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    toast.error('Error al cambiar favorito: ' + error.message);
    throw error;
  }
}
