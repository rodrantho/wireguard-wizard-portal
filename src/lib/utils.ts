import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import QRCode from "qrcode.react"
import { renderToString } from "react-dom/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateWireguardKeys() {
  // Generate private key (32 random bytes encoded as base64)
  const privateKey = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256" // We use ECDH as a source of randomness
    },
    true,
    ["deriveKey"]
  );
  
  // Convert to byte array and then to base64 - this is simulated
  // In a real app, we'd use proper WireGuard key generation
  const privateBytes = crypto.getRandomValues(new Uint8Array(32));
  const privateBase64 = btoa(String.fromCharCode.apply(null, [...privateBytes]));
  
  // Simulate a public key - in a real app, this would be derived from the private key
  // using WireGuard's key derivation function
  const publicBytes = crypto.getRandomValues(new Uint8Array(32));
  const publicBase64 = btoa(String.fromCharCode.apply(null, [...publicBytes]));
  
  return {
    privateKey: privateBase64,
    publicKey: publicBase64
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
add allowed-address=${clientIp}/32 interface=${interfaceName} public-key="${publicKey}" comment="${clientName}"
`;
}

export async function generateQRCode(content: string): Promise<string> {
  try {
    // Create QR code SVG string using renderToString
    const qrCodeSvg = renderToString(
      QRCode({
        value: content,
        size: 256,
        bgColor: "#000000",
        fgColor: "#3b82f6",
        level: "M",
        includeMargin: true
      })
    );
    
    const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCodeSvg)}`;
    
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
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
