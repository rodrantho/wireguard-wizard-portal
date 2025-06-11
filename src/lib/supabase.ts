import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { logAccess } from './auditService';

// Export the supabase client from integrations directly
export const supabase = supabaseClient;

export type Cliente = {
  id: string;
  nombre: string;
  ip_cloud: string;
  public_key: string;
  interfaz: string;
  puerto: string;  // Nuevo campo puerto
  display_order?: number; // Nuevo campo para drag & drop
  created_at?: string;
};

export type VpnPeer = {
  id: string;
  cliente_id: string;
  nombre_peer: string;
  ip_asignada: string;
  config_texto: string;
  comando_mikrotik: string;
  qr_img_url: string;
  fecha_creacion?: string;
  private_key?: string; // Guardamos temporalmente para la descarga
  public_key?: string; // Guardamos temporalmente para la configuración
  estado?: string; // Nuevo campo para el estado del peer
  display_order?: number; // Nuevo campo para drag & drop
  download_token?: string; // New field for public download token
  download_count?: number; // Number of times downloaded
  download_limit?: number; // Maximum downloads allowed
  download_expires_at?: string; // Expiration date for download
  is_download_active?: boolean; // Whether download is active
};

export type Usuario = {
  id: string;
  email: string;
};

// Autenticación
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    // Log login access
    await logAccess('login', 'auth');
    return data;
  } catch (error: any) {
    toast.error('Error de inicio de sesión: ' + error.message);
    throw error;
  }
}

export async function logoutUser() {
  try {
    // Log logout access before signing out
    await logAccess('logout', 'auth');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    toast.error('Error al cerrar sesión: ' + error.message);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user;
  } catch (error: any) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
}

// Funciones para clientes
export async function getClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('display_order', { ascending: true })
      .order('nombre', { ascending: true });

    if (error) throw error;
    
    // Log access
    await logAccess('view_clientes', 'clientes');
    
    return data as Cliente[];
  } catch (error: any) {
    toast.error('Error al obtener clientes: ' + error.message);
    return [];
  }
}

export async function getClienteById(id: string) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Log access
    await logAccess('view_cliente', 'cliente', id);
    
    return data as Cliente;
  } catch (error: any) {
    toast.error('Error al obtener cliente: ' + error.message);
    throw error;
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select();

    if (error) throw error;
    toast.success('Cliente creado con éxito');
    
    // Log access happens automatically via trigger
    
    return data[0] as Cliente;
  } catch (error: any) {
    toast.error('Error al crear cliente: ' + error.message);
    throw error;
  }
}

export async function updateCliente(id: string, cliente: Partial<Omit<Cliente, 'id'>>) {
  try {
    const { error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id);

    if (error) throw error;
    toast.success('Cliente actualizado con éxito');
    
    // Log access happens automatically via trigger
    
  } catch (error: any) {
    toast.error('Error al actualizar cliente: ' + error.message);
    throw error;
  }
}

export async function deleteCliente(id: string) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Cliente eliminado con éxito');
    
    // Log access happens automatically via trigger
    
  } catch (error: any) {
    toast.error('Error al eliminar cliente: ' + error.message);
    throw error;
  }
}

// Funciones para VPN peers
export async function getPeers(clienteId?: string) {
  try {
    let query = supabase
      .from('vpn_peers')
      .select('*, clientes(nombre)')
      .order('display_order', { ascending: true })
      .order('fecha_creacion', { ascending: false });
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    // Log access
    await logAccess('view_peers', clienteId ? 'cliente' : 'peers', clienteId);
    
    return data as (VpnPeer & { clientes: { nombre: string } })[];
  } catch (error: any) {
    toast.error('Error al obtener peers: ' + error.message);
    return [];
  }
}

export async function getPeerById(id: string) {
  try {
    const { data, error } = await supabase
      .from('vpn_peers')
      .select('*, clientes(nombre)')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Log access
    await logAccess('view_peer', 'peer', id);
    
    return data as (VpnPeer & { clientes: { nombre: string } });
  } catch (error: any) {
    toast.error('Error al obtener peer: ' + error.message);
    throw error;
  }
}

export async function createPeer(peer: Omit<VpnPeer, 'id' | 'fecha_creacion'>) {
  try {
    // Generate a unique download token for the peer
    const downloadToken = globalThis.crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('vpn_peers')
      .insert([{ 
        ...peer, 
        fecha_creacion: new Date().toISOString(),
        download_token: downloadToken,
        download_count: 0,
        download_limit: 1,
        download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_download_active: true
      }])
      .select();

    if (error) throw error;
    toast.success('Peer creado con éxito');
    
    // Log access happens automatically via trigger
    
    return data[0] as VpnPeer;
  } catch (error: any) {
    toast.error('Error al crear peer: ' + error.message);
    throw error;
  }
}

export async function updatePeer(id: string, peer: Partial<Omit<VpnPeer, 'id'>>) {
  try {
    const { error } = await supabase
      .from('vpn_peers')
      .update(peer)
      .eq('id', id);

    if (error) throw error;
    toast.success('Peer actualizado con éxito');
    
    // Log access happens automatically via trigger
    
  } catch (error: any) {
    toast.error('Error al actualizar peer: ' + error.message);
    throw error;
  }
}

export async function deletePeer(id: string) {
  try {
    const { error } = await supabase
      .from('vpn_peers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Peer eliminado con éxito');
    
    // Log access happens automatically via trigger
    
  } catch (error: any) {
    toast.error('Error al eliminar peer: ' + error.message);
    throw error;
  }
}
