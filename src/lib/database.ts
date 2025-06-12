
import { DATABASE_CONFIG } from './config';
import type { Cliente, VpnPeer, Usuario } from './supabase';

// Import functions based on provider
let dbFunctions: any;

if (DATABASE_CONFIG.provider === 'firebase') {
  dbFunctions = import('./firebase');
} else {
  dbFunctions = import('./supabase');
}

// Auth functions
export async function loginUser(email: string, password: string) {
  const db = await dbFunctions;
  return db.loginUser(email, password);
}

export async function logoutUser() {
  const db = await dbFunctions;
  return db.logoutUser();
}

export async function getCurrentUser() {
  const db = await dbFunctions;
  return db.getCurrentUser();
}

// Cliente functions
export async function getClientes(): Promise<Cliente[]> {
  const db = await dbFunctions;
  return db.getClientes();
}

export async function getClienteById(id: string): Promise<Cliente> {
  const db = await dbFunctions;
  return db.getClienteById(id);
}

export async function createCliente(cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
  const db = await dbFunctions;
  return db.createCliente(cliente);
}

export async function updateCliente(id: string, cliente: Partial<Omit<Cliente, 'id'>>): Promise<void> {
  const db = await dbFunctions;
  return db.updateCliente(id, cliente);
}

export async function deleteCliente(id: string): Promise<void> {
  const db = await dbFunctions;
  return db.deleteCliente(id);
}

// VPN Peer functions
export async function getPeers(clienteId?: string): Promise<(VpnPeer & { clientes: { nombre: string } })[]> {
  const db = await dbFunctions;
  return db.getPeers(clienteId);
}

export async function getPeerById(id: string): Promise<VpnPeer & { clientes: { nombre: string } }> {
  const db = await dbFunctions;
  return db.getPeerById(id);
}

export async function createPeer(peer: Omit<VpnPeer, 'id' | 'fecha_creacion'>): Promise<VpnPeer> {
  const db = await dbFunctions;
  return db.createPeer(peer);
}

export async function updatePeer(id: string, peer: Partial<Omit<VpnPeer, 'id'>>): Promise<void> {
  const db = await dbFunctions;
  return db.updatePeer(id, peer);
}

export async function deletePeer(id: string): Promise<void> {
  const db = await dbFunctions;
  return db.deletePeer(id);
}

// Export types for compatibility
export type { Cliente, VpnPeer, Usuario };
