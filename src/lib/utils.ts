
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { x25519 } from '@noble/curves/ed25519'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateWireguardKeys() {
  // Generate a proper 32-byte private key for WireGuard (Curve25519)
  const privateKeyBytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  
  // Clamp the private key according to Curve25519 requirements
  privateKeyBytes[0] &= 248;
  privateKeyBytes[31] &= 127;
  privateKeyBytes[31] |= 64;
  
  // Convert private key to base64
  const privateKey = btoa(String.fromCharCode.apply(null, [...privateKeyBytes]));
  
  // Generate the correct public key using Curve25519 scalar multiplication
  const publicKeyBytes = x25519.getPublicKey(privateKeyBytes);
  const publicKey = btoa(String.fromCharCode.apply(null, [...publicKeyBytes]));
  
  console.log('Generated WireGuard keys:', { 
    privateKey: privateKey.substring(0, 10) + '...', 
    publicKey: publicKey.substring(0, 10) + '...' 
  });
  
  return {
    privateKey: privateKey,
    publicKey: publicKey
  };
}

export function ipAdd(ip: string, offset: number): string {
  // Split the IP address into octets
  const octets = ip.split('.').map(Number);
  
  // Convert to a single number
  let ipNum = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  
  // Add the offset
  ipNum += offset;
  
  // Convert back to octets
  const newOctets = [
    (ipNum >> 24) & 255,
    (ipNum >> 16) & 255,
    (ipNum >> 8) & 255,
    ipNum & 255
  ];
  
  // Join the octets and return the new IP
  return newOctets.join('.');
}

export function createWireguardConfig(
  privateKey: string,
  clientIp: string,
  serverPublicKey: string,
  endpoint: string,
  port: string,
  allowedIps: string
): string {
  return `[Interface]
PrivateKey = ${privateKey}
Address = ${clientIp}/32
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
AllowedIPs = ${allowedIps}
Endpoint = ${endpoint}:${port}
PersistentKeepalive = 25
`;
}

export function createMikrotikCommand(
  clientIp: string,
  publicKey: string,
  interfaceName: string,
  clientName: string
): string {
  return `/interface wireguard peers
add allowed-address=${clientIp}/32 interface=${interfaceName} public-key="${publicKey}" comment="${clientName}" responder=yes
`;
}

export async function generateQRCode(content: string): Promise<string> {
  try {
    // Usar la API de QR Server para generar el QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(content)}`;
    
    // Verificar que la URL funcione haciendo una petición
    const response = await fetch(qrApiUrl);
    if (response.ok) {
      console.log('QR code generated successfully using QR Server API');
      return qrApiUrl;
    } else {
      throw new Error('QR Server API response not ok');
    }
  } catch (error) {
    console.error('Error generating QR code with external API:', error);
    
    // Fallback: intentar generar usando canvas (si está disponible)
    try {
      return await generateQRCodeCanvas(content);
    } catch (canvasError) {
      console.error('Error generating QR code with canvas:', canvasError);
      return '';
    }
  }
}

async function generateQRCodeCanvas(content: string): Promise<string> {
  // Crear un QR code usando canvas como fallback
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  canvas.width = 300;
  canvas.height = 300;
  
  // Fondo negro
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 300, 300);
  
  // Por ahora, mostrar un patrón simple como placeholder
  // En una implementación real, aquí usarías una librería de QR
  ctx.fillStyle = '#3b82f6';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QR Code', 150, 150);
  ctx.fillText('Generated', 150, 170);
  
  return canvas.toDataURL('image/png');
}

export function convertToDownloadableLink(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

// Helper function to validate client input
export function validateClientInput(client: { nombre: string; ip_cloud: string; public_key: string; interfaz: string }) {
  const errors: Record<string, string> = {};
  
  if (!client.nombre) errors.nombre = "El nombre del cliente es obligatorio";
  if (!client.ip_cloud) errors.ip_cloud = "La IP pública del cliente es obligatoria";
  if (!client.public_key) errors.public_key = "La clave pública es obligatoria";
  if (!client.interfaz) errors.interfaz = "El nombre de la interfaz es obligatorio";
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Helper function to validate peer input
export function validatePeerInput(peer: { 
  nombre_peer: string; 
  ip_asignada: string;
}) {
  const errors: Record<string, string> = {};
  
  if (!peer.nombre_peer) errors.nombre_peer = "El nombre del peer es obligatorio";
  if (!peer.ip_asignada) errors.ip_asignada = "La IP asignada es obligatoria";
  
  // Validate IP format (simple check)
  if (peer.ip_asignada && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(peer.ip_asignada)) {
    errors.ip_asignada = "Formato de IP inválido";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function generateDownloadLink(downloadToken: string, peerName: string): string {
  // Use the new public download endpoint that doesn't require authentication
  const baseUrl = window.location.origin;
  const downloadUrl = `${baseUrl}/functions/v1/download/${downloadToken}`;
  return downloadUrl;
}
