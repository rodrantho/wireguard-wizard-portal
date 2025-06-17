
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { DATABASE_CONFIG, isFirebaseConfigured } from './config';
import type { Cliente, VpnPeer, Usuario } from './supabase';

// Only initialize Firebase if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(DATABASE_CONFIG.firebase);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    toast.error('Error al configurar Firebase');
  }
} else {
  console.warn('Firebase not configured - missing required environment variables');
}

export { auth, db };

// Helper function to check if Firebase is available
const checkFirebaseAvailable = () => {
  if (!auth || !db) {
    throw new Error('Firebase no está configurado correctamente. Verifique las variables de entorno.');
  }
};

// Helper function to convert Firestore timestamp to ISO string
const timestampToISOString = (timestamp: any): string => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return new Date().toISOString();
};

// Convert Firebase document to Cliente type
const docToCliente = (doc: any): Cliente => ({
  id: doc.id,
  nombre: doc.data().nombre || '',
  ip_cloud: doc.data().ip_cloud || '',
  public_key: doc.data().public_key || '',
  interfaz: doc.data().interfaz || '',
  puerto: doc.data().puerto || '51820',
  display_order: doc.data().display_order || 0,
  created_at: timestampToISOString(doc.data().created_at)
});

// Convert Firebase document to VpnPeer type
const docToPeer = (doc: any): VpnPeer => ({
  id: doc.id,
  cliente_id: doc.data().cliente_id || '',
  nombre_peer: doc.data().nombre_peer || '',
  ip_asignada: doc.data().ip_asignada || '',
  config_texto: doc.data().config_texto || '',
  comando_mikrotik: doc.data().comando_mikrotik || '',
  qr_img_url: doc.data().qr_img_url || '',
  fecha_creacion: timestampToISOString(doc.data().fecha_creacion),
  private_key: doc.data().private_key,
  public_key: doc.data().public_key,
  estado: doc.data().estado || 'activo',
  display_order: doc.data().display_order || 0,
  download_token: doc.data().download_token,
  download_count: doc.data().download_count || 0,
  download_limit: doc.data().download_limit || 1,
  download_expires_at: timestampToISOString(doc.data().download_expires_at),
  is_download_active: doc.data().is_download_active ?? true
});

// Autenticación
export async function loginUser(email: string, password: string) {
  checkFirebaseAvailable();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    toast.error('Error de inicio de sesión: ' + error.message);
    throw error;
  }
}

export async function logoutUser() {
  checkFirebaseAvailable();
  try {
    await signOut(auth);
  } catch (error: any) {
    toast.error('Error al cerrar sesión: ' + error.message);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  checkFirebaseAvailable();
  return auth.currentUser;
}

// Funciones para clientes
export async function getClientes(): Promise<Cliente[]> {
  checkFirebaseAvailable();
  try {
    const q = query(collection(db, 'clientes'), orderBy('display_order'), orderBy('nombre'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToCliente);
  } catch (error: any) {
    toast.error('Error al obtener clientes: ' + error.message);
    return [];
  }
}

export async function getClienteById(id: string): Promise<Cliente> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docToCliente(docSnap);
    } else {
      throw new Error('Cliente no encontrado');
    }
  } catch (error: any) {
    toast.error('Error al obtener cliente: ' + error.message);
    throw error;
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
  checkFirebaseAvailable();
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...cliente,
      created_at: Timestamp.now()
    });
    
    toast.success('Cliente creado con éxito');
    
    const newDoc = await getDoc(docRef);
    return docToCliente(newDoc);
  } catch (error: any) {
    toast.error('Error al crear cliente: ' + error.message);
    throw error;
  }
}

export async function updateCliente(id: string, cliente: Partial<Omit<Cliente, 'id'>>): Promise<void> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, cliente);
    toast.success('Cliente actualizado con éxito');
  } catch (error: any) {
    toast.error('Error al actualizar cliente: ' + error.message);
    throw error;
  }
}

export async function deleteCliente(id: string): Promise<void> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'clientes', id);
    await deleteDoc(docRef);
    toast.success('Cliente eliminado con éxito');
  } catch (error: any) {
    toast.error('Error al eliminar cliente: ' + error.message);
    throw error;
  }
}

// Funciones para VPN peers
export async function getPeers(clienteId?: string): Promise<(VpnPeer & { clientes: { nombre: string } })[]> {
  checkFirebaseAvailable();
  try {
    let q = query(collection(db, 'vpn_peers'), orderBy('display_order'), orderBy('fecha_creacion', 'desc'));
    
    if (clienteId) {
      q = query(collection(db, 'vpn_peers'), where('cliente_id', '==', clienteId), orderBy('display_order'));
    }
    
    const querySnapshot = await getDocs(q);
    const peers = await Promise.all(
      querySnapshot.docs.map(async (peerDoc) => {
        const peer = docToPeer(peerDoc);
        
        // Get cliente name
        const clienteDoc = await getDoc(doc(db, 'clientes', peer.cliente_id));
        const clienteNombre = clienteDoc.exists() ? clienteDoc.data().nombre : 'Cliente no encontrado';
        
        return {
          ...peer,
          clientes: { nombre: clienteNombre }
        };
      })
    );
    
    return peers;
  } catch (error: any) {
    toast.error('Error al obtener peers: ' + error.message);
    return [];
  }
}

export async function getPeerById(id: string): Promise<VpnPeer & { clientes: { nombre: string } }> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'vpn_peers', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const peer = docToPeer(docSnap);
      
      // Get cliente name
      const clienteDoc = await getDoc(doc(db, 'clientes', peer.cliente_id));
      const clienteNombre = clienteDoc.exists() ? clienteDoc.data().nombre : 'Cliente no encontrado';
      
      return {
        ...peer,
        clientes: { nombre: clienteNombre }
      };
    } else {
      throw new Error('Peer no encontrado');
    }
  } catch (error: any) {
    toast.error('Error al obtener peer: ' + error.message);
    throw error;
  }
}

export async function createPeer(peer: Omit<VpnPeer, 'id' | 'fecha_creacion'>): Promise<VpnPeer> {
  checkFirebaseAvailable();
  try {
    const downloadToken = globalThis.crypto.randomUUID();
    
    const docRef = await addDoc(collection(db, 'vpn_peers'), {
      ...peer,
      fecha_creacion: Timestamp.now(),
      download_token: downloadToken,
      download_count: 0,
      download_limit: 1,
      download_expires_at: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      is_download_active: true
    });
    
    toast.success('Peer creado con éxito');
    
    const newDoc = await getDoc(docRef);
    return docToPeer(newDoc);
  } catch (error: any) {
    toast.error('Error al crear peer: ' + error.message);
    throw error;
  }
}

export async function updatePeer(id: string, peer: Partial<Omit<VpnPeer, 'id'>>): Promise<void> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'vpn_peers', id);
    await updateDoc(docRef, peer);
    toast.success('Peer actualizado con éxito');
  } catch (error: any) {
    toast.error('Error al actualizar peer: ' + error.message);
    throw error;
  }
}

export async function deletePeer(id: string): Promise<void> {
  checkFirebaseAvailable();
  try {
    const docRef = doc(db, 'vpn_peers', id);
    await deleteDoc(docRef);
    toast.success('Peer eliminado con éxito');
  } catch (error: any) {
    toast.error('Error al eliminar peer: ' + error.message);
    throw error;
  }
}
