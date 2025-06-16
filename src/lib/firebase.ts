
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { toast } from 'sonner';
import { DATABASE_CONFIG } from './config';
import type { Cliente, VpnPeer, Usuario } from './supabase';

// Initialize Firebase
const app = initializeApp(DATABASE_CONFIG.firebase);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    toast.error('Error de inicio de sesión: ' + error.message);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    toast.error('Error al cerrar sesión: ' + error.message);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return auth.currentUser;
}

// Helper function to convert Firestore timestamp to ISO string
const timestampToIso = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Cliente functions
export async function getClientes(): Promise<Cliente[]> {
  try {
    const clientesRef = collection(db, 'clientes');
    // Simplificamos la consulta para evitar índices complejos
    const querySnapshot = await getDocs(clientesRef);
    
    let clientes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: timestampToIso(doc.data().created_at)
    })) as Cliente[];
    
    // Ordenamos en memoria para evitar índices
    clientes = clientes.sort((a, b) => {
      const aOrder = a.display_order || 0;
      const bOrder = b.display_order || 0;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.nombre.localeCompare(b.nombre);
    });
    
    return clientes;
  } catch (error: any) {
    console.error('Error al obtener clientes:', error);
    toast.error('Error al obtener clientes: ' + error.message);
    return [];
  }
}

export async function getClienteById(id: string): Promise<Cliente> {
  try {
    console.log('Fetching cliente by ID:', id);
    const clienteRef = doc(db, 'clientes', id);
    const clienteSnap = await getDoc(clienteRef);
    
    if (!clienteSnap.exists()) {
      throw new Error('Cliente no encontrado');
    }
    
    return {
      id: clienteSnap.id,
      ...clienteSnap.data(),
      created_at: timestampToIso(clienteSnap.data()?.created_at)
    } as Cliente;
  } catch (error: any) {
    console.error('Error al obtener cliente:', error);
    toast.error('Error al obtener cliente: ' + error.message);
    throw error;
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
  try {
    console.log('Creating cliente in Firebase:', cliente);
    
    const clienteData = {
      ...cliente,
      created_at: Timestamp.now(),
      display_order: cliente.display_order || 0
    };
    
    const docRef = await addDoc(collection(db, 'clientes'), clienteData);
    console.log('Cliente created with ID:', docRef.id);
    
    toast.success('Cliente creado con éxito');
    
    return {
      id: docRef.id,
      ...cliente,
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error creating cliente:', error);
    toast.error('Error al crear cliente: ' + error.message);
    throw error;
  }
}

export async function updateCliente(id: string, cliente: Partial<Omit<Cliente, 'id'>>): Promise<void> {
  try {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, cliente);
    toast.success('Cliente actualizado con éxito');
  } catch (error: any) {
    toast.error('Error al actualizar cliente: ' + error.message);
    throw error;
  }
}

export async function deleteCliente(id: string): Promise<void> {
  try {
    const clienteRef = doc(db, 'clientes', id);
    await deleteDoc(clienteRef);
    toast.success('Cliente eliminado con éxito');
  } catch (error: any) {
    toast.error('Error al eliminar cliente: ' + error.message);
    throw error;
  }
}

// VPN Peer functions
export async function getPeers(clienteId?: string): Promise<(VpnPeer & { clientes: { nombre: string } })[]> {
  try {
    const peersRef = collection(db, 'vpn_peers');
    let querySnapshot;
    
    if (clienteId) {
      // Consulta simple con filtro
      const q = query(peersRef, where('cliente_id', '==', clienteId));
      querySnapshot = await getDocs(q);
    } else {
      // Consulta simple sin filtros
      querySnapshot = await getDocs(peersRef);
    }
    
    const peers: (VpnPeer & { clientes: { nombre: string } })[] = [];
    
    for (const peerDoc of querySnapshot.docs) {
      const peerData = peerDoc.data();
      
      // Get client name
      let clienteName = 'Cliente no encontrado';
      if (peerData.cliente_id) {
        try {
          const clienteRef = doc(db, 'clientes', peerData.cliente_id);
          const clienteSnap = await getDoc(clienteRef);
          if (clienteSnap.exists()) {
            clienteName = clienteSnap.data().nombre;
          }
        } catch (error) {
          console.error('Error getting client name:', error);
        }
      }
      
      peers.push({
        id: peerDoc.id,
        ...peerData,
        fecha_creacion: timestampToIso(peerData.fecha_creacion),
        download_expires_at: timestampToIso(peerData.download_expires_at),
        clientes: { nombre: clienteName }
      } as VpnPeer & { clientes: { nombre: string } });
    }
    
    // Ordenar en memoria
    peers.sort((a, b) => {
      const aOrder = a.display_order || 0;
      const bOrder = b.display_order || 0;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
    });
    
    return peers;
  } catch (error: any) {
    console.error('Error al obtener peers:', error);
    toast.error('Error al obtener peers: ' + error.message);
    return [];
  }
}

export async function getPeerById(id: string): Promise<VpnPeer & { clientes: { nombre: string } }> {
  try {
    const peerRef = doc(db, 'vpn_peers', id);
    const peerSnap = await getDoc(peerRef);
    
    if (!peerSnap.exists()) {
      throw new Error('Peer no encontrado');
    }
    
    const peerData = peerSnap.data();
    
    // Get client name
    let clienteName = 'Cliente no encontrado';
    if (peerData.cliente_id) {
      const clienteRef = doc(db, 'clientes', peerData.cliente_id);
      const clienteSnap = await getDoc(clienteRef);
      if (clienteSnap.exists()) {
        clienteName = clienteSnap.data().nombre;
      }
    }
    
    return {
      id: peerSnap.id,
      ...peerData,
      fecha_creacion: timestampToIso(peerData.fecha_creacion),
      download_expires_at: timestampToIso(peerData.download_expires_at),
      clientes: { nombre: clienteName }
    } as VpnPeer & { clientes: { nombre: string } };
  } catch (error: any) {
    toast.error('Error al obtener peer: ' + error.message);
    throw error;
  }
}

export async function createPeer(peer: Omit<VpnPeer, 'id' | 'fecha_creacion'>): Promise<VpnPeer> {
  try {
    const downloadToken = globalThis.crypto.randomUUID();
    
    const peerData = {
      ...peer,
      fecha_creacion: Timestamp.now(),
      download_token: downloadToken,
      download_count: 0,
      download_limit: 1,
      download_expires_at: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      is_download_active: true,
      display_order: peer.display_order || 0,
      estado: peer.estado || 'activo'
    };
    
    const docRef = await addDoc(collection(db, 'vpn_peers'), peerData);
    toast.success('Peer creado con éxito');
    
    return {
      id: docRef.id,
      ...peer,
      fecha_creacion: new Date().toISOString(),
      download_token: downloadToken,
      download_count: 0,
      download_limit: 1,
      download_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_download_active: true
    };
  } catch (error: any) {
    toast.error('Error al crear peer: ' + error.message);
    throw error;
  }
}

export async function updatePeer(id: string, peer: Partial<Omit<VpnPeer, 'id'>>): Promise<void> {
  try {
    const peerRef = doc(db, 'vpn_peers', id);
    
    // Convert date strings to Timestamps if present
    const updateData = { ...peer };
    if (updateData.download_expires_at && typeof updateData.download_expires_at === 'string') {
      updateData.download_expires_at = Timestamp.fromDate(new Date(updateData.download_expires_at));
    }
    
    await updateDoc(peerRef, updateData);
    toast.success('Peer actualizado con éxito');
  } catch (error: any) {
    toast.error('Error al actualizar peer: ' + error.message);
    throw error;
  }
}

export async function deletePeer(id: string): Promise<void> {
  try {
    const peerRef = doc(db, 'vpn_peers', id);
    await deleteDoc(peerRef);
    toast.success('Peer eliminado con éxito');
  } catch (error: any) {
    toast.error('Error al eliminar peer: ' + error.message);
    throw error;
  }
}
