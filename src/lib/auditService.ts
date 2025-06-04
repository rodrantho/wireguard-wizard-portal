
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AuditLog, Comment, AccessLog, ActivityFeed, SystemAlert } from './auditTypes';

// Funciones para Audit Logs
export async function getAuditLogs(tableFilter?: string, recordFilter?: string) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (tableFilter) {
      query = query.eq('table_name', tableFilter);
    }

    if (recordFilter) {
      query = query.eq('record_id', recordFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AuditLog[];
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

// Funciones para Comments
export async function getComments(entityType: 'cliente' | 'peer', entityId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Comment[];
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function createComment(entityType: 'cliente' | 'peer', entityId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        entity_type: entityType,
        entity_id: entityId,
        content: content
      }])
      .select();

    if (error) throw error;
    toast.success('Comentario agregado');
    return data[0] as Comment;
  } catch (error: any) {
    toast.error('Error al agregar comentario');
    throw error;
  }
}

export async function updateComment(id: string, content: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    toast.success('Comentario actualizado');
  } catch (error: any) {
    toast.error('Error al actualizar comentario');
    throw error;
  }
}

export async function deleteComment(id: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Comentario eliminado');
  } catch (error: any) {
    toast.error('Error al eliminar comentario');
    throw error;
  }
}

// Funciones para Access Logs
export async function logAccess(action: string, resourceType: string, resourceId?: string) {
  try {
    await supabase
      .from('access_logs')
      .insert([{
        action,
        resource_type: resourceType,
        resource_id: resourceId
      }]);
  } catch (error: any) {
    console.error('Error logging access:', error);
  }
}

export async function getAccessLogs() {
  try {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data as AccessLog[];
  } catch (error: any) {
    console.error('Error fetching access logs:', error);
    return [];
  }
}

// Funciones para Activity Feed
export async function getActivityFeed(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ActivityFeed[];
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

// Funciones para System Alerts
export async function getSystemAlerts() {
  try {
    const { data, error } = await supabase
      .from('system_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SystemAlert[];
  } catch (error: any) {
    console.error('Error fetching system alerts:', error);
    return [];
  }
}

export async function markAlertAsRead(id: string) {
  try {
    const { error } = await supabase
      .from('system_alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error marking alert as read:', error);
  }
}

export async function createAlert(alertType: string, title: string, message: string, severity: string = 'medium') {
  try {
    const { error } = await supabase
      .from('system_alerts')
      .insert([{
        alert_type: alertType,
        title,
        message,
        severity
      }]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error creating alert:', error);
  }
}

// Funciones para Drag & Drop
export async function updateClienteOrder(clienteId: string, newOrder: number) {
  try {
    const { error } = await supabase
      .from('clientes')
      .update({ display_order: newOrder })
      .eq('id', clienteId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating cliente order:', error);
    throw error;
  }
}

export async function updatePeerOrder(peerId: string, newOrder: number) {
  try {
    const { error } = await supabase
      .from('vpn_peers')
      .update({ display_order: newOrder })
      .eq('id', peerId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating peer order:', error);
    throw error;
  }
}
