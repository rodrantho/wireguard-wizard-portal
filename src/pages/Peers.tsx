
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPeers, getClienteById, Cliente, VpnPeer, deletePeer } from "@/lib/supabase";
import { Plus, Eye, Trash, Download } from "lucide-react";
import { convertToDownloadableLink } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function Peers() {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState<any[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<VpnPeer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [clienteId]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const peersData = await getPeers(clienteId);
      setPeers(peersData);
      
      if (clienteId) {
        const clienteData = await getClienteById(clienteId);
        setCliente(clienteData);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePeer = () => {
    if (clienteId) {
      navigate(`/crear-peer/${clienteId}`);
    } else {
      navigate("/crear-peer");
    }
  };
  
  const handleViewPeer = (peer: VpnPeer) => {
    setSelectedPeer(peer);
    setIsViewDialogOpen(true);
  };
  
  const handleDeletePeer = async (id: string) => {
    try {
      await deletePeer(id);
      setPeers(peers.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar peer:", error);
    }
  };
  
  const handleDownloadConfig = (peer: VpnPeer) => {
    convertToDownloadableLink(peer.config_texto, `${peer.nombre_peer.replace(/\s+/g, "_")}.conf`);
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {cliente ? `Peers VPN - ${cliente.nombre}` : "Todos los Peers VPN"}
          </h1>
          {cliente && (
            <p className="text-gray-500">Interfaz: {cliente.interfaz}</p>
          )}
        </div>
        <Button onClick={handleCreatePeer} className="bg-vpn hover:bg-vpn-dark">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Peer
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn"></div>
        </div>
      ) : peers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay peers</CardTitle>
            <CardDescription>
              {cliente 
                ? `No hay peers VPN para ${cliente.nombre}. Crea uno nuevo.` 
                : "No hay peers VPN. Selecciona un cliente y crea un nuevo peer."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreatePeer}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Peer VPN
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  {!clienteId && <TableHead>Cliente</TableHead>}
                  <TableHead>IP Asignada</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peers.map((peer) => (
                  <TableRow key={peer.id}>
                    <TableCell className="font-medium">{peer.nombre_peer}</TableCell>
                    {!clienteId && (
                      <TableCell>{peer.clientes?.nombre}</TableCell>
                    )}
                    <TableCell>{peer.ip_asignada}</TableCell>
                    <TableCell>
                      {new Date(peer.fecha_creacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewPeer(peer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadConfig(peer)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar peer?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el peer VPN "{peer.nombre_peer}".
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePeer(peer.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detalles del Peer: {selectedPeer?.nombre_peer}
            </DialogTitle>
          </DialogHeader>
          {selectedPeer && (
            <QRCodeDisplay
              qrImageUrl={selectedPeer.qr_img_url}
              configText={selectedPeer.config_texto}
              clientName={selectedPeer.nombre_peer}
              commandText={selectedPeer.comando_mikrotik}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
