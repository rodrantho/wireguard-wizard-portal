
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClienteById, Cliente, getClientes, createPeer } from "@/lib/supabase";
import PeerForm from "@/components/PeerForm";
import { PeerFormData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateWireguardKeys, createWireguardConfig, createMikrotikCommand, ipAdd, generateQRCode } from "@/lib/utils";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";

export default function CrearPeer() {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clienteId || "");
  const [generatedPeers, setGeneratedPeers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [clienteId]);
  
  const fetchData = async () => {
    try {
      const clientesData = await getClientes();
      setAllClientes(clientesData);
      
      if (clienteId) {
        const clienteData = await getClienteById(clienteId);
        setCliente(clienteData);
        setSelectedClienteId(clienteId);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClienteChange = (id: string) => {
    setSelectedClienteId(id);
    const selected = allClientes.find(c => c.id === id);
    setCliente(selected || null);
  };
  
  const handleSubmit = async (data: PeerFormData) => {
    if (!selectedClienteId || !cliente) return;
    
    setSubmitting(true);
    try {
      const generatedPeersArray = [];
      const count = data.multiple ? (data.count || 1) : 1;
      
      for (let i = 0; i < count; i++) {
        // Generar claves
        const keys = await generateWireguardKeys();
        
        // Calcular IP (si son múltiples)
        const ip = data.multiple ? ipAdd(data.ip_asignada, i) : data.ip_asignada;
        
        // Crear configuración wireguard
        const configText = createWireguardConfig(
          keys.privateKey,
          ip,
          cliente.public_key,
          data.endpoint || cliente.ip_cloud,
          data.port || cliente.puerto || "51820",
          data.allowed_ips || "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"
        );
        
        // Crear comando MikroTik
        const peerName = data.multiple ? `${data.nombre_peer}-${i+1}` : data.nombre_peer;
        const mikrotikCommand = createMikrotikCommand(
          ip,
          keys.publicKey,
          cliente.interfaz,
          peerName
        );
        
        // Generar QR
        const qrImageUrl = await generateQRCode(configText);
        
        // Guardar en la base de datos
        const peerData = {
          cliente_id: selectedClienteId,
          nombre_peer: peerName,
          ip_asignada: ip,
          config_texto: configText,
          comando_mikrotik: mikrotikCommand,
          qr_img_url: qrImageUrl,
          private_key: keys.privateKey,
          public_key: keys.publicKey
        };
        
        const savedPeer = await createPeer(peerData);
        generatedPeersArray.push(savedPeer);
      }
      
      setGeneratedPeers(generatedPeersArray);
      setShowResults(true);
      
    } catch (error) {
      console.error("Error al generar peer:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleFinish = () => {
    if (clienteId) {
      navigate(`/peers/${clienteId}`);
    } else {
      navigate("/peers");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">
        {showResults ? "Peers Generados" : "Crear Nuevo Peer VPN"}
      </h1>
      
      {!showResults ? (
        <div className="flex justify-center">
          <PeerForm 
            onSubmit={handleSubmit}
            isLoading={submitting}
            cliente={cliente || undefined}
            allClientes={allClientes}
            clienteSeleccionado={selectedClienteId}
            onClienteChange={handleClienteChange}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {generatedPeers.map((peer) => (
            <Card key={peer.id} className="mb-6 bg-black/30 backdrop-blur-lg border border-blue-500/30">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-blue-400">{peer.nombre_peer}</CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodeDisplay
                  qrImageUrl={peer.qr_img_url}
                  configText={peer.config_texto}
                  clientName={peer.nombre_peer}
                  commandText={peer.comando_mikrotik}
                />
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleFinish} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Finalizar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
